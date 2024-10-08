import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before } from 'mocha';
import server from '@/app'; // Your Express app instance
import db from '@/database'; // Mock the DB instance

chai.should();
chai.use(chaiHttp);

// Mock the DB response for products
describe('Product API Tests', () => {
  before(() => {
    // Mock the response from the database for listing products
    db.models.product.findAndCountAll = async () => ({
      rows: [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ],
      count: 2,
    });

    // Mock the response for finding a product by ID
    db.models.product.findOne = async (options) => {
      if (options.where.id === 1) {
        return { id: 1, name: 'Product 1', price: 100 };
      }
      return null; // Return null for non-existing product
    };

    // Mock the response for creating a product
    db.models.product.create = async (data) => ({
      id: 3,
      ...data,
    });

    // Mock the response for updating a product
    db.models.product.findByPk = async (id) => {
      if (id === 1) {
        return {
          id: 1,
          name: 'Product 1',
          price: 100,
          update: async (data) => ({ ...data, id: 1 }),
        };
      }
      return null; // Return null for non-existing product
    };

    // Mock the response for deleting a product
    db.models.product.destroy = async (options) => {
      if (options.where.id === 1) {
        return 1; // Return 1 row deleted
      }
      return 0; // Return 0 rows deleted for non-existing product
    };
  });

  // Test for getting products list
  describe('GET /products', () => {
    it('should return a list of products with 200 status code', (done) => {
      chai.request(server)
        .get('/products?page=1&perPage=10')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('rows').with.lengthOf(2); // Check if two products are returned
          res.body.should.have.property('count').eql(2);
          done();
        });
    });
  });

  // Test for getting a product by ID
  describe('GET /products/:id', () => {
    it('should return product with 200 status code', (done) => {
      chai.request(server)
        .get('/products/1')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(1);
          res.body.should.have.property('name').eql('Product 1');
          done();
        });
    });

    it('should return 404 for a non-existing product', (done) => {
      chai.request(server)
        .get('/products/999')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('Product not found');
          done();
        });
    });
  });

  // Test for creating a product
  describe('POST /products', () => {
    it('should create a new product and return it with 201 status code', (done) => {
      const product = { name: 'Product 3', price: 150 };
      chai.request(server)
        .post('/products')
        .send(product)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(3);
          res.body.should.have.property('name').eql('Product 3');
          done();
        });
    });
  });

  // Test for updating a product
  describe('PUT /products/:id', () => {
    it('should update an existing product and return the updated product', (done) => {
      const updatedProduct = { name: 'Updated Product 1', price: 120 };
      chai.request(server)
        .put('/products/1')
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(1);
          res.body.should.have.property('name').eql('Updated Product 1');
          done();
        });
    });

    it('should return 404 for updating a non-existing product', (done) => {
      const updatedProduct = { name: 'Updated Product', price: 120 };
      chai.request(server)
        .put('/products/999')
        .send(updatedProduct)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('Product not found');
          done();
        });
    });
  });

  // Test for deleting a product
  describe('DELETE /products/:id', () => {
    it('should delete an existing product and return 204 status code', (done) => {
      chai.request(server)
        .delete('/products/1')
        .end((err, res) => {
          res.should.have.status(204);
          done();
        });
    });

    it('should return 404 for deleting a non-existing product', (done) => {
      chai.request(server)
        .delete('/products/999')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('Product not found');
          done();
        });
    });
  });
});
