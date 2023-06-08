let filter; 

const data = [
  ['red', 'square', 'large'],
  ['red', 'square', 'small'],
  ['red', 'circle', 'large'],
  ['blue', 'square', 'medium'],
  ['blue', 'triangle', 'small']
];


const items = data.map(([color, shape, size]) => {
  return {
    color,
    shape,
    size
  };
});

document.querySelectorAll('.facet').forEach( div => {
  div.addEventListener('change', (ev)=> {
    const name = ev.target.name;
    const value = ev.target.value;
    const checked = ev.target.checked;
    if(checked){
      filter[name] = value;
    }
    else {
      delete filter[name];
    }
    //remove empty keys
    const _filter = Object.entries(filter).reduce((acc, [key, val])=> {
      if(val){
        acc[key] = val;
      }
      return acc;
    }, {});

    window.location.hash = Object.keys(_filter).length ? JSON.stringify(_filter): '';
  });
});

const renderFacet = (facetName, mappedData, filter, div)=> {
  const html = Object.entries(mappedData).map(([key, value])=> `
    <label>${ key } (${ value }) <input ${ filter[facetName] === key ? 'checked': ''} type='checkbox' name='${facetName}' value='${key}'/></label>
    `).join(''); 
  div.innerHTML = html;
};

const group = (items, facetName)=> {
  return items.reduce((acc, item)=> {
    const key = item[facetName];
    acc[key] = acc[key] || 0;
    acc[key]++
    return acc;
  }, {});
};

const render = ()=> {
  const itemsDiv = document.querySelector('#items');
  const colorsDiv = document.querySelector('#colors');
  const shapesDiv = document.querySelector('#shapes');
  const sizesDiv = document.querySelector('#sizes');

  const hash = window.location.hash.slice(1);
  if(hash){
    filter = JSON.parse(decodeURI(window.location.hash.slice(1)));
  }
  else {
    filter = { size: '', color: '', shape: '' };
  }
  const html = items
    .filter( item => {
      return (!filter.color || item.color === filter.color) &&
        (!filter.shape || item.shape === filter.shape) &&
        (!filter.size || item.size === filter.size)
    })
    .map( ({ size, color, shape})=> `<li>${color} ${size } ${ shape}</li>`).join('');
  itemsDiv.innerHTML = html;

  const sizeMap = group(items
    .filter( item => {
      return (!filter.color || filter.color === item.color) && ( !filter.shape || filter.shape === item.shape);
    }), 'size');

  renderFacet('size', sizeMap, filter, sizesDiv);

  const shapeMap = group(items
    .filter( item => {
      return (!filter.color || filter.color === item.color) && ( !filter.size || filter.size === item.size) 
    }), 'shape');

  renderFacet('shape', shapeMap, filter, shapesDiv);


  const colorMap = group(items
    .filter( item => {
      return (!filter.shape || filter.shape === item.shape) && ( !filter.size || filter.size === item.size) 
    }), 'color');
  renderFacet('color', colorMap, filter, colorsDiv);
};

render();

window.addEventListener('hashchange', render);
