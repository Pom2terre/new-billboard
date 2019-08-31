// client-side js
// run by the browser each time your view template is loaded

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('form').addEventListener('submit', (event) => {
    event.stopPropagation();
    event.preventDefault();
    
    const name = document.querySelectorAll('form input[name="name"]')[0].value;
    const email = document.querySelectorAll('form input[name="email"]')[0].value;

    if (!validator.isAlphanumeric(name, 'fr-FR') || !validator.isLength(name, {min: 3, max: 100})) {
      alert('Name must be alphanumeric and between 3 and 100 characters');
      return
    }
    
    axios.post('/form', {
      name, 
      email
    }).then(() => {
      // remove all the content of the DOM main and add a 'Success' message.
    for(const item of document.querySelectorAll('main *')) {
      item.remove();
    }
    const p = document.createElement('p');
    const text = document.createTextNode('Success!');
    p.appendChild(text);
    document.querySelector('main').appendChild(p);
    });
  });
});