document.addEventListener('DOMContentLoaded', () => {
    const featuredProjects = document.querySelector('.featured_projects');
    const projects = document.querySelectorAll('.project');
    const navItems = document.querySelectorAll('.navigation_tabs .nav_item');
    const dock = document.querySelector('.navigation_tabs');

    if (!featuredProjects || projects.length === 0) return;

    // Scroll spy for navigation dock active state
    const updateActiveTab = () => {
        let activeIndex = 0; // Default to Home/First Item
        const containerScrollTop = featuredProjects.scrollTop;
        const containerHeight = featuredProjects.clientHeight;
        
        projects.forEach((project, index) => {
            const projectTop = project.offsetTop - featuredProjects.offsetTop;
            const projectHeight = project.clientHeight;
            
            // If the card is majorly visible in the scroll viewport
            if (containerScrollTop >= projectTop - containerHeight / 3) {
                activeIndex = index + 1; // index 0 is Home/About, projects start from index 1 in the dock
            }
        });

        // If we scrolled to the footer/view-more block
        const viewMore = document.querySelector('.view-more-grid-button');
        if (viewMore) {
            const viewMoreTop = viewMore.offsetTop - featuredProjects.offsetTop;
            if (containerScrollTop >= viewMoreTop - containerHeight / 2) {
                activeIndex = navItems.length - 1; // Select last nav item
            }
        }

        // Apply active class to navItems
        navItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.setAttribute('data-active', 'true');
                item.style.color = '#333333';
                item.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            } else {
                item.setAttribute('data-active', 'false');
                item.style.color = 'var(--color-nav-inactive)';
                item.style.backgroundColor = 'transparent';
            }
        });
    };

    // Listen to scroll events on desktop
    featuredProjects.addEventListener('scroll', updateActiveTab);
    
    // Listen to window scroll events on mobile
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 850) {
            let activeIndex = 0;
            const scrollPos = window.scrollY;
            const windowHeight = window.innerHeight;

            projects.forEach((project, index) => {
                const rect = project.getBoundingClientRect();
                if (rect.top <= windowHeight / 3) {
                    activeIndex = index + 1;
                }
            });

            navItems.forEach((item, index) => {
                if (index === activeIndex) {
                    item.setAttribute('data-active', 'true');
                    item.style.color = '#333333';
                    item.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                } else {
                    item.setAttribute('data-active', 'false');
                    item.style.color = 'var(--color-nav-inactive)';
                    item.style.backgroundColor = 'transparent';
                }
            });
        }
    });

    // Initialize state
    updateActiveTab();

    // Flowwow project card is now presented using a responsive auto-playing video element
});
