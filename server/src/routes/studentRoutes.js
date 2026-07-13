const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { studentSchema, studentUpdateSchema } = require('../validators/studentValidator');
const {
  getStudents,
  getStudentStats,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// GET /api/students/stats — must be before /:id to avoid conflict
router.get('/stats', getStudentStats);

// GET /api/students
router.get('/', getStudents);

// GET /api/students/:id
router.get('/:id', getStudent);

// POST /api/students
router.post('/', upload.single('photo'), validate(studentSchema), createStudent);

// PUT /api/students/:id
router.put('/:id', upload.single('photo'), validate(studentUpdateSchema), updateStudent);

// DELETE /api/students/:id
router.delete('/:id', deleteStudent);

module.exports = router;
