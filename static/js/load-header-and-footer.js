fetch('/header').then(res => res.text()).then(data => {
  document.getElementById('header-placeholder').innerHTML = data;
});
fetch('/footer').then(res => res.text()).then(data => {
  document.getElementById('footer-placeholder').innerHTML = data;
});