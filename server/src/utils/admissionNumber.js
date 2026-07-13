const prisma = require('../services/prismaClient');

const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ADM-${year}-`;

  const lastStudent = await prisma.student.findFirst({
    where: { admissionNo: { startsWith: prefix } },
    orderBy: { admissionNo: 'desc' },
  });

  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.admissionNo.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = { generateAdmissionNumber };
