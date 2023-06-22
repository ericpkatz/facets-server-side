//TODO
// search over an array of facet values within a facet
// weighted distributions for seeding
// keyword search
const Sequelize = require('sequelize');
const { DataTypes: { STRING } } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/facet_db');
const faker = require('faker');
const express = require('express');
const app = express();
const path = require('path');
app.use(require('morgan')('dev'));

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`listening on port ${port}`));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res, next)=> res.sendFile(path.join(__dirname, 'static/index.html')));

app.get('/app.js', (req, res, next)=> res.sendFile(path.join(__dirname, 'client/app.js')));
app.get('/style.css', (req, res, next)=> res.sendFile(path.join(__dirname, 'style.css')));

app.get('/api/facets/sizes', async(req, res, next)=> {
  try {
    let filter = {};
    if(req.query.filter){
      filter = JSON.parse(req.query.filter);
    }
    if(filter.colorId === ''){
      delete filter.colorId;
    }
    if(filter.sizeId === ''){
      delete filter.sizeId;
    }
    if(filter.shapeId === ''){
      delete filter.shapeId;
    }
    delete filter.sizeId;
    res.send(await Block.findAll({
      group: ['sizeId', 'size.id'],
      attributes: [
        'sizeId',
        [Sequelize.fn('count', Sequelize.col('*')), 'count']
      ],
      where: filter,
      include: [ {
        model: Size
      } ]
    }));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/facets/shapes', async(req, res, next)=> {
  try {
    let filter = {};
    if(req.query.filter){
      filter = JSON.parse(req.query.filter);
    }
    console.log(filter);
    if(filter.colorId === ''){
      delete filter.colorId;
    }
    if(filter.sizeId === ''){
      delete filter.sizeId;
    }
    if(filter.shapeId === ''){
      delete filter.shapeId;
    }
    delete filter.shapeId;
    res.send(await Block.findAll({
      group: ['shapeId', 'shape.id'],
      attributes: [
        'shapeId',
        [Sequelize.fn('count', Sequelize.col('*')), 'count']
      ],
      where: filter,
      include: [ {
        model: Shape
      } ]
    }));

  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/facets/colors', async(req, res, next)=> {
  try {
    let filter = {};
    if(req.query.filter){
      filter = JSON.parse(req.query.filter);
    }
    if(filter.colorId === ''){
      delete filter.colorId;
    }
    if(filter.sizeId === ''){
      delete filter.sizeId;
    }
    if(filter.shapeId === ''){
      delete filter.shapeId;
    }
    delete filter.colorId

    /*
    const replacements = [];
    if(filter.shapeId){
      replacements.push(filter.shapeId);
    }
    if(filter.sizeId){
      replacements.push(filter.sizeId);
    }
    let where = '';
    if(filter.shapeId && filter.sizeId){
      where = 'WHERE blocks."shapeId" = ? AND blocks."sizeId" = ?';
    }
    if(filter.shapeId && !filter.sizeId){
      where = 'WHERE blocks."shapeId" = ?';
    }
    if(!filter.shapeId && filter.sizeId){
      where = 'WHERE blocks."sizeId" = ?';
    }
    const SQL = `
      SELECT count(*), "colorId", colors.name
      FROM blocks
      JOIN colors
      ON colors.id = blocks."colorId"
      ${where}
      GROUP BY blocks."colorId", colors.name
    `;

    

    const results = (await conn.query(SQL, { replacements }))[0];
    res.send(results.map(item => {
      return {
        ...item,
        color: {
          id: item.colorId,
          name: item.name 
        }
      };
    }));
    */
    res.send(await Block.findAll({
      group: ['colorId', 'color.id'],
      attributes: [
        'colorId',
        [Sequelize.fn('count', Sequelize.col('*')), 'count']
      ],
      where: filter,
      include: [ {
        model: Color
      } ]
    }));

  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/blocks', async(req, res, next)=> {
  try {
    let filter = {};
    if(req.query.filter){
      filter = JSON.parse(req.query.filter);
    }
    if(filter.colorId === ''){
      delete filter.colorId;
    }
    if(filter.sizeId === ''){
      delete filter.sizeId;
    }
    if(filter.shapeId === ''){
      delete filter.shapeId;
    }
    res.send(await Block.findAll({ where: filter, include: [ Shape, Size, Color] }));

  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err.message);
  res.status(err.status || 500).send({ err });
});

const shapeNames = 'Triangle Circle Semi-Circle Square Rectangle Parallelogram Rhombus Trapezium Kite Polygons'.split(' ');

const sizeNames = 'xs small medium large xl xxl xxxl'.split(' ');

const allColors = require('./data/colors.json');


const Color = conn.define('color', {
  name: STRING 
});

const Shape = conn.define('shape', {
  name: STRING 
});

const Size = conn.define('size', {
  name: STRING 
});

const Block = conn.define('block', {});

Block.belongsTo(Size);
Block.belongsTo(Shape);
Block.belongsTo(Color);

Color.hasMany(Block);
Shape.hasMany(Block);
Size.hasMany(Block);

const seed = async()=> {
  try {
    await conn.sync({ force: true });
    const colorSet = new Set();
    while(colorSet.size < 20){
      colorSet.add(allColors[Math.floor(Math.random()*allColors.length)].name);
    }
    const colors = await Promise.all([...colorSet].map( name => Color.create({ name })));
    const shapes = await Promise.all(shapeNames.map( name => Shape.create({ name }))); 
    const sizes = await Promise.all(sizeNames.map( name => Size.create({ name })));

    const medium = await Size.findOne({ where: {
      name: 'medium'
    }});

    const _sizes = [...sizes, medium, medium, medium];

    const blocks = [];

    while(blocks.length < 1000){
      blocks.push({
        shapeId: faker.random.arrayElement(shapes).id,
        sizeId: faker.random.arrayElement(_sizes).id,
        colorId: faker.random.arrayElement(colors).id
      });
    }
    await Promise.all(blocks.map( block => Block.create(block)));
  }
  catch(ex){
    console.log(ex);
  }
};
if(process.env.SEED){
  seed();
}

