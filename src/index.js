import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams, HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

const root = createRoot(document.querySelector('#root'));


const Facet = ({ filter, items, name, idProperty, nameProperty })=> {
  return (
      <div>
        <h2>{ name }</h2>
        <ul>
          {
            items.map( item => {
              const _filter = {...filter, [idProperty]: item[idProperty] };
              if(filter[idProperty] === item[idProperty]){
                _filter[idProperty] = '';
              } 
              return (
                <li key={ item[idProperty] }>
                  <Link to={`/${JSON.stringify(_filter)}`} style={{ fontWeight: filter[idProperty] === item[idProperty] ? 'bold': ''}}>
                    { item[nameProperty].name } ({ item.count })
                  </Link>
                </li>
              );
            })
          }
        </ul>
      </div>
  );
};


const Search = ()=> {
  const { filterString } = useParams();
  const [shapes, setShapes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const filter = filterString ? JSON.parse(filterString): { colorId: '', sizeId: '', shapeId: ''};


  useEffect(()=> {
    axios.get(`/api/facets/shapes?filter=${JSON.stringify(filter)}`)
      .then(response => {
        setShapes(response.data);
      });
  }, [filterString]);

  useEffect(()=> {
    axios.get(`/api/facets/colors?filter=${JSON.stringify(filter)}`)
      .then(response => {
        setColors(response.data);
      });
  }, [filterString]);

  useEffect(()=> {
    axios.get(`/api/facets/sizes?filter=${JSON.stringify(filter)}`)
      .then(response => {
        setSizes(response.data);
      });
  }, [filterString]);

  useEffect(()=> {
    axios.get(`/api/blocks?filter=${JSON.stringify(filter)}`)
      .then(response => {
        setBlocks(response.data);
      });
  }, [filterString]);
  
  return (
    <div>
      <Link to='/'>Facet Search</Link>
        <main>
        <section>
          <Facet filter={ filter } items={ shapes } name='Shapes' idProperty='shapeId' nameProperty='shape' />
          <Facet filter={ filter } items={ colors } name='Colors' idProperty='colorId' nameProperty='color' />
          <Facet filter={ filter } items={ sizes } name='Sizes' idProperty='sizeId' nameProperty='size' />
        </section>
        <section>
          <h2>Blocks ({ blocks.length })</h2>
          <ul>
            {
              blocks.map( block => {
                return (
                  <li style={{ color: block.color.name }}>
                    { block.color.name } { block.size.name } { block.shape.name }
                  </li>
                );
              })
            }
          </ul>
        </section>
        </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path='/' element={ <Search /> } />
      <Route path='/:filterString' element={ <Search /> } />
    </Routes>
  );
}; 

root.render(<Router><App /></Router>);
