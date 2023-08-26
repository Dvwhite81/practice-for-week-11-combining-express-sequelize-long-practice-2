'use strict';

const { Insect, Tree } = require('../models');
const { Op } = require('sequelize');

const seedData = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   for (let insectIdx = 0; insectIdx < seedData.length; insectIdx++) {
      const { insect, trees } = seedData[insectIdx];
      const currentInsect = await Insect.findOne({ where: insect });
      const currentTrees = await Tree.findAll({ where: { [Op.or]: trees } });

      await currentInsect.addTrees(currentTrees);
   }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    for (let insectIdx = 0; insectIdx < seedData.length; insectIdx++) {
      const { insect, trees } = seedData[insectIdx];
      const currentInsect = await Insect.findOne({ where: insect });
      const currentTrees = await Tree.findAll({ where: { [Op.or]: trees } });

      await currentInsect.removeTrees(currentTrees);
   }
  }
};
