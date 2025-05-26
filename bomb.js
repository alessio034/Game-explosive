// bomb.js
export class Bomb {
  constructor(x, y, size, level) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.level = level;
    this.exploding = false;
    this.explosionRadius = 0;
    this.maxRadius = 50 + level * 5;
    this.explosionSpeed = 10 + level;
    this.image = new Image();
    this.image.src = "img/nuclear-explosion.png";
  }

  draw(ctx) {
    if (this.exploding) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.explosionRadius);
      gradient.addColorStop(0.0, 'rgba(255, 255, 200, 0.9)');
      gradient.addColorStop(0.3, 'rgba(255, 120, 0, 0.7)');
      gradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.4)');
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.explosionRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();

      if (this.image.complete) {
        ctx.drawImage(this.image, this.x - 50, this.y - 50, 100, 100);
      }
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'orange';
      ctx.fill();
      ctx.closePath();
    }
  }

  updateExplosion(callback) {
    this.exploding = true;
    this.explosionRadius = 0;

    const interval = setInterval(() => {
      this.explosionRadius += this.explosionSpeed;

      if (this.explosionRadius >= this.maxRadius) {
        clearInterval(interval);
        this.exploding = false;
        if (callback) callback();
      }
    }, 50);
  }

  isPlayerInRange(playerX, playerY, playerSize) {
    const dx = playerX + playerSize / 2 - this.x;
    const dy = playerY + playerSize / 2 - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.explosionRadius;
  }
}
