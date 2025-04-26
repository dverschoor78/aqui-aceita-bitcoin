fetch('templates/header.html').then(res => res.text()).then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
  });
  fetch('templates/footer.html').then(res => res.text()).then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });