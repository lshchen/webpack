function loader (source) {
  let style = `
    let style = document.createElement('style');
    style.innderHTML = ${JSON.stringify(source)}
    document.head.appendChild(style);
  `;
  return style;
}