/* ---------------- This section must be at the top: ---------------- */
for (let module in require.cache) { delete require.cache[module] }
const path = require('path');
const DB_TEST_FILE = 'db/' + path.basename(__filename, '.js') + '.db';
const SERVER_DB_TEST_FILE = 'server/' + DB_TEST_FILE;
process.env.DB_TEST_FILE = SERVER_DB_TEST_FILE;
/* ------------------------------------------------------------------ */

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
let chaiHttp = require('chai-http');
let server = require('../server/app');
chai.use(chaiHttp);
const expect = chai.expect;

const { resetDB, seedAllDB, removeTestDB, runSQLQuery } = require('./utils/test-utils');

describe('Intermediate Phase 4 - UPDATE Using Sequelize Queries', () => {

  before(async () => {
    await resetDB(DB_TEST_FILE);
    return await seedAllDB(DB_TEST_FILE);
  });

  after(async () => {
    return await removeTestDB(DB_TEST_FILE);
  });

  describe('PUT /trees/:id (valid requests)', () => {

    it('update a valid tree by id', async () => {

        const reqBody = {
            "id": 3,
            "name": "President-edit",
            "location": "Sequoia National Park-edit",
            "height": 240.91,
            "size": 93.1
        }

        await chai.request(server)
            .put(`/trees/${reqBody.id}`)
            .send(reqBody)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('success');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('Successfully updated tree');
                expect(res.body).to.have.property('data');

                expect(res.body.data.id).to.equal(reqBody.id);
                expect(res.body.data.tree).to.equal(reqBody.name);
                expect(res.body.data.location).to.equal(reqBody.location);
                expect(res.body.data.heightFt).to.equal(reqBody.height);
                expect(res.body.data.groundCircumferenceFt).to.equal(reqBody.size);
                expect(res.body.data).to.have.property('updatedAt');
                expect(res.body.data).to.have.property('createdAt');
            });
    });

    it('tree was updated in the database', async () => {
      const sqlResponse = await runSQLQuery("SELECT * FROM Trees WHERE id = 3;", SERVER_DB_TEST_FILE)
      expect(sqlResponse).to.be.an('array');
      expect(sqlResponse).to.have.length(1);
      expect(sqlResponse[0].tree).to.equal("President-edit");
    });
  });


  describe('PUT /trees/:id (invalid requests)', () => {

    it('cannot update a tree that does not exist', async () => {

        const reqBody = {
            "id": 17,
            "name": "Invalid-edit",
            "location": "My backyard-edit",
            "height": 100,
            "size": 25
        }

        await chai.request(server)
            .put(`/trees/${reqBody.id}`)
            .send(reqBody)
            .then((res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('not-found');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal(`Could not update tree ${reqBody.id}`);
                expect(res.body).to.have.property('details');
                expect(res.body.details).to.equal('Tree not found');
            });
    });

    it('handles request body ids and request params ids that do not match', async () => {
        const paramsId = 2

        const reqBody = {
            "id": 3,
            "name": "mismatch-edit",
            "location": "mismatch-edit",
            "height": 135,
            "size": 72
        }

        await chai.request(server)
            .put(`/trees/${paramsId}`)
            .send(reqBody)
            .then((res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('error');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('Could not update tree');
                expect(res.body).to.have.property('details');
                expect(res.body.details).to.equal(`${paramsId} does not match ${reqBody.id}`);
            });
    });

    it('invalid id requests do not update either database record', async () => {
      const sqlResponse1 = await runSQLQuery("SELECT * FROM Trees WHERE id = 3;", SERVER_DB_TEST_FILE)
      expect(sqlResponse1).to.be.an('array');
      expect(sqlResponse1).to.have.length(1);
      expect(sqlResponse1[0].tree).to.not.equal("mismatch-edit");

      const sqlResponse2 = await runSQLQuery("SELECT * FROM Trees WHERE id = 2;", SERVER_DB_TEST_FILE)
      expect(sqlResponse2).to.be.an('array');
      expect(sqlResponse2).to.have.length(1);
      expect(sqlResponse2[0].tree).to.not.equal("mismatch-edit");
    });
  });
});