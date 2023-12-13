'use strict';
{
    const cursor = document.querySelector('.cursor');
    window.addEventListener('mousemove', (e)=>{
        let x = e.clientX;
        let y = e.clientY;
        cursor.style = `transform: translate(${x}px, ${y}px) scale(1.0)`;

    })


}