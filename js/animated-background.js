/**
 * Script pour créer un arrière-plan animé
 */
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'élément d'arrière-plan
    const background = document.createElement('div');
    background.className = 'animated-background';
    document.body.appendChild(background);
    
    // Créer l'élément SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    background.appendChild(svg);
    
    // Générer des formes aléatoires
    for (let i = 0; i < 15; i++) {
        createRandomShape(svg);
    }
});

/**
 * Crée une forme aléatoire dans l'élément SVG
 */
function createRandomShape(svg) {
    const shapes = ['circle', 'rect', 'ellipse', 'path'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let shape;
    
    switch (randomShape) {
        case 'circle':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            shape.setAttribute('cx', Math.random() * 100 + '%');
            shape.setAttribute('cy', Math.random() * 100 + '%');
            shape.setAttribute('r', Math.random() * 50 + 20);
            break;
        case 'rect':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('x', Math.random() * 100 + '%');
            shape.setAttribute('y', Math.random() * 100 + '%');
            shape.setAttribute('width', Math.random() * 100 + 50);
            shape.setAttribute('height', Math.random() * 100 + 50);
            break;
        case 'ellipse':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shape.setAttribute('cx', Math.random() * 100 + '%');
            shape.setAttribute('cy', Math.random() * 100 + '%');
            shape.setAttribute('rx', Math.random() * 80 + 20);
            shape.setAttribute('ry', Math.random() * 50 + 20);
            break;
        case 'path':
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const points = [];
            for (let i = 0; i < 5; i++) {
                points.push((Math.random() * 100) + ',' + (Math.random() * 100));
            }
            shape.setAttribute('d', 'M' + points.join(' L') + ' Z');
            break;
    }
    
    shape.classList.add('shape');
    svg.appendChild(shape);
}
