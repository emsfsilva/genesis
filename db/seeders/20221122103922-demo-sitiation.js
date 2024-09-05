// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "situations"
    return queryInterface.bulkInsert('situations', [{
      nameSituation: 'Tecnico',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nameSituation: 'Gestão',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nameSituation: 'Administrativo',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      nameSituation: 'Comum',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down () {
    
  }
};
