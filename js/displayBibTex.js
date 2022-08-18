function displayBibTex(filename) {


  fetch("pdf/"+filename)
.then((result) => {
    result.text()
    .then(text=> {
        softalert(text)
        text = text.split('\\').join('\\\\')
        console.log(text);
    })
})
}





