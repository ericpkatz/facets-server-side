let filter; 

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
    //remove empty keys (if not filtering on value, don't show it in url)
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
  const html = mappedData.map((item)=> {
    const key = `${facetName}Id`;//ie colorId
    const id = item[key];//ie the id of the color
    const name = item[facetName].name;//ie the name of the color
    const filterValue = filter[key]*1;//ie the selected colorId
    return `
      <label>${ name } (${ item.count }) <input ${ filterValue === id ? 'checked': ''} type='checkbox' name='${key}' value='${id}'/></label>
    `
  }).join(''); 
  div.innerHTML = html;
};

const render = async()=> {
  const itemsDiv = document.querySelector('#items');
  const colorsDiv = document.querySelector('#colors');
  const shapesDiv = document.querySelector('#shapes');
  const sizesDiv = document.querySelector('#sizes');

  const hash = window.location.hash.slice(1);
  if(hash){
    filter = JSON.parse(decodeURI(window.location.hash.slice(1)));
  }
  else {
    filter = { sizeId: '', colorId: '', shapeId: '' };
  }
  const blocks = (await axios.get(`/api/blocks?filter=${JSON.stringify(filter)}`)).data;
  const html = blocks
    .map( ({ size, color, shape})=> `<li>
      <span style='background-color:${color.name}'>${color.name}</span> <span class='${size.name}'>${size.name }</span> ${ shape.name}
      </li>`).join('');
  itemsDiv.innerHTML = html;
  itemsDiv.previousElementSibling.querySelector('span').innerHTML = `(${ blocks.length })`;

  const sizes = (await axios.get(`/api/facets/sizes?filter=${JSON.stringify(filter)}`)).data;
  renderFacet('size', sizes, filter, sizesDiv);
  const shapes = (await axios.get(`/api/facets/shapes?filter=${JSON.stringify(filter)}`)).data;
  renderFacet('shape', shapes, filter, shapesDiv);
  const colors = (await axios.get(`/api/facets/colors?filter=${JSON.stringify(filter)}`)).data;
  renderFacet('color', colors, filter, colorsDiv);
};

render();

window.addEventListener('hashchange', render);
