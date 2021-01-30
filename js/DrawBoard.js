function DrawBoard(){
  this.size = canvas.width;
  this.resolution = 28;
  this.pixelSize = this.size/this.resolution;
  this.pixels = [];

  for (let row = 0; row < this.resolution; row++) {
    this.pixels.push([]);
    for (let col = 0; col < this.resolution; col++){
      this.pixels[row].push({x: col*this.pixelSize, y: row*this.pixelSize, color: 0});
    }
  }

  this.resize = () => {
    this.size = canvas.width;
    this.pixelSize = this.size/this.resolution;
    for (let row = 0; row < this.resolution; row++) {
      for (let col = 0; col < this.resolution; col++){
        this.pixels[row][col].x = col*this.pixelSize;
        this.pixels[row][col].y = row*this.pixelSize;
      }
    }
    this.draw();
  }

  this.addColor = (row, col, color) => {
    if(row >= 0 && row < this.resolution &&
       col >= 0 && col < this.resolution){
      this.pixels[row][col].color += color;
      if(this.pixels[row][col].color > 255)
        this.pixels[row][col].color = 255;
    }
  }

  this.draw = () => {
    for (let pixels of this.pixels) {
      for (let pixel of pixels) {
        ctx.beginPath();
        ctx.rect(pixel.x, pixel.y, this.pixelSize, this.pixelSize);
        ctx.fillStyle = 'rgb(' + pixel.color + ',' + pixel.color +',' + pixel.color + ')';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}
