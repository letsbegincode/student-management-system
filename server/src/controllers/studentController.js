const prisma = require('../services/prismaClient');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const { generateAdmissionNumber } = require('../utils/admissionNumber');
const { logActivity } = require('../utils/activityLogger');

/**
 * GET /api/students
 * Fetch all students with pagination, search, filter, and sort.
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      course = '',
      year = '',
      gender = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (course) where.course = course;
    if (year) where.year = parseInt(year, 10);
    if (gender) where.gender = gender;

    // Validate sortBy field
    const allowedSortFields = ['name', 'admissionNo', 'course', 'year', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/stats
 * Dashboard analytics — counts, course breakdown, gender ratio.
 */
const getStudentStats = async (req, res, next) => {
  try {
    const [
      total,
      courseGroups,
      genderGroups,
      yearGroups,
      recentStudents,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.groupBy({ by: ['course'], _count: { course: true }, orderBy: { _count: { course: 'desc' } } }),
      prisma.student.groupBy({ by: ['gender'], _count: { gender: true } }),
      prisma.student.groupBy({ by: ['year'], _count: { year: true }, orderBy: { year: 'asc' } }),
      prisma.student.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, admissionNo: true, course: true, photoUrl: true, createdAt: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byCourse: courseGroups.map((g) => ({ course: g.course, count: g._count.course })),
        byGender: genderGroups.map((g) => ({ gender: g.gender, count: g._count.gender })),
        byYear: yearGroups.map((g) => ({ year: g.year, count: g._count.year })),
        recentStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Fetch a single student by ID.
 */
const getStudent = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students
 * Create a new student with optional photo upload.
 */
const createStudent = async (req, res, next) => {
  try {
    const data = req.validatedBody;
    const admissionNo = await generateAdmissionNumber();

    // Handle photo upload via Cloudinary (backend-only)
    let photoUrl = null;
    let photoPublicId = null;
    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      photoUrl = result.url;
      photoPublicId = result.publicId;
    }

    const student = await prisma.student.create({
      data: {
        ...data,
        dob: new Date(data.dob),
        admissionNo,
        photoUrl,
        photoPublicId,
      },
    });

    // Log activity
    await logActivity('CREATE', student.id, student.name, {
      admissionNo: student.admissionNo,
      course: student.course,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists`,
      });
    }
    next(error);
  }
};

/**
 * PUT /api/students/:id
 * Update student details and optionally replace photo.
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const data = req.validatedBody;

    // Handle photo replacement
    let photoUpdate = {};
    if (req.file) {
      // Delete old photo from Cloudinary
      if (existing.photoPublicId) {
        await deleteImage(existing.photoPublicId);
      }
      const result = await uploadImage(req.file.buffer);
      photoUpdate = { photoUrl: result.url, photoPublicId: result.publicId };
    }

    // Convert dob if present
    if (data.dob) {
      data.dob = new Date(data.dob);
    }

    const student = await prisma.student.update({
      where: { id },
      data: { ...data, ...photoUpdate },
    });

    // Build details of what changed
    const changes = {};
    for (const key of Object.keys(data)) {
      if (String(existing[key]) !== String(data[key])) {
        changes[key] = { from: existing[key], to: data[key] };
      }
    }
    if (req.file) changes.photo = 'Updated';

    await logActivity('UPDATE', student.id, student.name, changes);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists`,
      });
    }
    next(error);
  }
};

/**
 * DELETE /api/students/:id
 * Remove a student and their photo from Cloudinary.
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete photo from Cloudinary
    if (student.photoPublicId) {
      await deleteImage(student.photoPublicId);
    }

    await prisma.student.delete({ where: { id } });

    await logActivity('DELETE', id, student.name, {
      admissionNo: student.admissionNo,
      course: student.course,
    });

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentStats,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
