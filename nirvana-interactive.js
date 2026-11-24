/* ==========================================================================
   NIRVANA INTERACTIVE SUITE
   - 3D Perspective Card Tilt & Mode Switcher
   - Active Navigation Highlight
   - Smooth Scroll & Back-to-Top
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 3D Perspective Card Interactivity (Nirvana Facade Studio Pattern)
    const card = document.getElementById('nirvana3DCard');
    const stage = document.querySelector('.perspective-stage-inner') || document.querySelector('.perspective-stage');

    if (card && stage) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });

        // Mode Switcher: Production / Golden Hour / Night Run
        const modeBtns = card.querySelectorAll('.mode-btn');
        const nodeIcons = card.querySelectorAll('.arch-node i');

        modeBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modeBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const mode = btn.dataset.mode;
                if (mode === 'day') {
                    stage.style.background = 'radial-gradient(circle at 50% 50%, #ffffff 0%, #F5F1E8 100%)';
                    nodeIcons.forEach((icon) => (icon.style.color = '#B69B65'));
                } else if (mode === 'sunset') {
                    stage.style.background = 'radial-gradient(circle at 50% 50%, #FAF0E6 0%, #EAD8C0 100%)';
                    nodeIcons.forEach((icon) => (icon.style.color = '#C6A46A'));
                } else if (mode === 'night') {
                    stage.style.background = 'radial-gradient(circle at 50% 50%, #1F1F1F 0%, #101010 100%)';
                    nodeIcons.forEach((icon) => (icon.style.color = '#D9BD87'));
                }
            });
        });
    }

    // 2. Back to Top Handler
    document.querySelectorAll('.back-to-top').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});
