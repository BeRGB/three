import * as THREE from 'three';
    import lottie from 'lottie-web';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { ScrollSmoother } from 'gsap/ScrollSmoother';

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // === SMOOTHER ===
    ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      effects: true
    });

    // === THREE.JS ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load('textures/crate.jpg');
    const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ map: texture }));
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    scene.add(light);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / maxScroll;

      gsap.to(cube.rotation, {
        y: scrollProgress * Math.PI * 4,
        x: scrollProgress * Math.PI * 2,
        duration: 0.3,
        overwrite: true
      });

      gsap.to(camera.position, {
        z: 5 - scrollProgress * 3,
        duration: 0.3,
        overwrite: true
      });
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // === SVG ===
    const path = document.querySelector("#line");
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: ".draw-svg-section",
          start: "top center",
          end: "bottom center",
          scrub: true
        }
      });
    }

    // === LOTTIE ===
    const animation = lottie.loadAnimation({
      container: document.getElementById('lottie'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'animations/example.json'
    });

    animation.addEventListener('DOMLoaded', () => {
      const totalFrames = animation.totalFrames;
      const scrubObj = { frame: 0 };
      let currentFrame = 0;

      gsap.to(scrubObj, {
        frame: totalFrames - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.lottie-section',
          start: 'top center',
          end: 'bottom center',
          scrub: true
        },
        onUpdate: () => {
          currentFrame += (scrubObj.frame - currentFrame) * 0.1;
          animation.goToAndStop(currentFrame, true);
        }
      });
    });
