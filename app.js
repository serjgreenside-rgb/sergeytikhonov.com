document.addEventListener('DOMContentLoaded', () => {
    // === CUSTOM INTERACTIVE CURSOR ===
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let hasMoved = false;

    // Track mouse coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!hasMoved) {
            cursorX = mouseX;
            cursorY = mouseY;
            hasMoved = true;
        }
    });

    // Smooth cursor interpolation using requestAnimationFrame
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        // Linear interpolation factor (speed of follower)
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX - 3}px, ${cursorY - 3}px, 0)`;
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    // Start animation loop
    animateCursor();

    // Hover state triggers
    const hoverElements = document.querySelectorAll('a, button, .fw-sub-blue-1, .palette-stripe, .web-bar, .blue-cell, .close-btn, .accordion-item, .ws-card');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hovered');
        });
    });

    // Ensure the cursor's hovered class is removed when entering the card block
    const fwBlueCard = document.getElementById('fw-blue-card');
    if (fwBlueCard) {
        fwBlueCard.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.remove('hovered');
        });
    }


    // === CV MODAL CONTROLS ===
    const cvLinks = document.querySelectorAll('#link-cv, #footer-link-cv');
    const modal = document.getElementById('cv-modal');
    const closeModal = document.getElementById('close-modal');

    if (cvLinks.length > 0 && modal) {
        cvLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    if (closeModal && modal) {
        const closeCVModal = () => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        };

        closeModal.addEventListener('click', closeCVModal);

        // Close on clicking outside the content block
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCVModal();
            }
        });
    }


    // === AI PALETTE INTERACTIVE COPY ===
    const stripes = document.querySelectorAll('.palette-stripe');
    stripes.forEach(stripe => {
        stripe.addEventListener('click', () => {
            const color = stripe.getAttribute('data-color');
            if (color) {
                navigator.clipboard.writeText(color).then(() => {
                    // Visual feedback
                    const originalText = stripe.getAttribute('data-color');
                    stripe.setAttribute('data-color', 'Copied!');
                    stripe.classList.add('copied');
                    
                    // Reset text after 1.5 seconds
                    setTimeout(() => {
                        stripe.setAttribute('data-color', originalText);
                        stripe.classList.remove('copied');
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy color: ', err);
                });
            }
        });
    });


    // === SUBTLE HOVER EFFECT ON STATS ===
    const stats = document.querySelectorAll('.stat-block');
    stats.forEach(stat => {
        stat.addEventListener('mouseenter', () => {
            // Trigger parent or nearby elements highlights
            stat.style.backgroundColor = '#fafafa';
        });
        stat.addEventListener('mouseleave', () => {
            stat.style.backgroundColor = '';
        });
    });

    // === FLOWWOW CARD STACK LOOP ANIMATION ===
    const stack = document.getElementById('fw-card-stack');
    const cards = stack ? Array.from(stack.querySelectorAll('.card')) : [];
    let currentIndex = 0;
    let autoSwipeInterval;
    let isTransitioning = false;

    function updateCardClasses() {
        if (cards.length === 0) return;
        cards.forEach((card, index) => {
            card.classList.remove('active', 'next', 'next-2', 'exit');
            
            // Calculate relative index from the current top card
            const relativeIndex = (index - currentIndex + cards.length) % cards.length;
            
            if (relativeIndex === 0) {
                card.classList.add('active');
            } else if (relativeIndex === 1) {
                card.classList.add('next');
            } else if (relativeIndex === 2) {
                card.classList.add('next-2');
            }
        });
    }

    function swipeCard() {
        if (cards.length === 0 || isTransitioning) return;
        isTransitioning = true;
        
        // Find current top card and add exit class to trigger slide-out CSS transition
        const activeCard = cards[currentIndex];
        if (activeCard) {
            activeCard.classList.add('exit');
            activeCard.classList.remove('active');
        }
        
        // After transition completes, cycle currentIndex and update stack state
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % cards.length;
            updateCardClasses();
            isTransitioning = false;
        }, 550); // matches Snappy slide out transition
    }

    function startAutoSwipe() {
        stopAutoSwipe();
        autoSwipeInterval = setInterval(swipeCard, 3000); // 3 seconds interval
    }

    function stopAutoSwipe() {
        if (autoSwipeInterval) {
            clearInterval(autoSwipeInterval);
        }
    }

    // Initialize stack state
    if (cards.length > 0) {
        updateCardClasses();
        startAutoSwipe();
        
        // Swipe manually on stack click
        stack.addEventListener('click', (e) => {
            e.stopPropagation();
            swipeCard();
            startAutoSwipe(); // resets auto interval
        });

        // 3D Parallax Tilt Micro-animation
        const blueCardBlock = document.getElementById('fw-blue-card');
        if (blueCardBlock) {
            blueCardBlock.addEventListener('mousemove', (e) => {
                const rect = blueCardBlock.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5; // normalized -0.5 to 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5; // normalized -0.5 to 0.5
                
                // Apply dynamic angles (max 15 degrees rotation)
                stack.style.setProperty('--rotate-x', `${-y * 16}deg`);
                stack.style.setProperty('--rotate-y', `${x * 16}deg`);
                
                // Smooth transition during active mouse tracking
                stack.style.transition = 'transform 0.1s ease-out';
                
                // Pause gentle rest floating during hover interaction
                stack.style.animationPlayState = 'paused';
            });

            blueCardBlock.addEventListener('mouseleave', () => {
                // Reset rotation angles smoothly
                stack.style.setProperty('--rotate-x', '0deg');
                stack.style.setProperty('--rotate-y', '0deg');
                
                // Resume standard ease-in-out transition back to center
                stack.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                
                // Resume rest floating animation
                stack.style.animationPlayState = 'running';
            });
        }
    }

    // Initialize 3D product carousel
    init3DCarousel();

    // === SCROLL REVEAL ANIMATION FOR MOBILE QUOTE ===
    const quoteLines = document.querySelectorAll('.quote-line');
    if (quoteLines.length > 0) {
        const handleQuoteScroll = () => {
            const triggerPoint = window.innerHeight * 0.8;
            quoteLines.forEach(line => {
                const rect = line.getBoundingClientRect();
                if (rect.top < triggerPoint) {
                    line.classList.add('highlighted');
                } else {
                    line.classList.remove('highlighted');
                }
            });
        };
        window.addEventListener('scroll', handleQuoteScroll);
        window.addEventListener('resize', handleQuoteScroll);
        // Run once initially to capture initial position
        handleQuoteScroll();
    }
});

// 3D Revolving Door Carousel Logic
function init3DCarousel() {
    const carousel = document.getElementById('fw-carousel-3d');
    if (!carousel) return;
    
    const cards = carousel.querySelectorAll('.carousel-card');
    let currentIndex = 0;
    
    function rotateCarousel() {
        currentIndex++;
        carousel.style.transform = `rotateY(${-45 * currentIndex}deg)`;
        
        // Update classes (active, side, hidden) dynamically based on 3D rotation step
        cards.forEach((card, idx) => {
            const relativeIdx = (idx - currentIndex) % 8;
            const normalizedIdx = relativeIdx < 0 ? relativeIdx + 8 : relativeIdx;
            
            card.classList.remove('active', 'side');
            if (normalizedIdx === 0) {
                card.classList.add('active');
            } else if (normalizedIdx === 1 || normalizedIdx === 7) {
                card.classList.add('side');
            }
        });
    }
    
    // Auto rotate every 2.5 seconds (stopping 2-3s in center)
    setInterval(rotateCarousel, 2500);
}

