module.exports = function(list, title){
  let item =  list.filter((item)=>item.title === title);
  return item[0];
};
