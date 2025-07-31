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

// === VIDEO FLAG (FIXED SCALE VIA MESH SIZE + POSITION SHIFT FROM TOP) ===
const flagCanvas = document.getElementById('flagCanvas');
const renderer2 = new THREE.WebGLRenderer({ canvas: flagCanvas, alpha: true });
renderer2.setSize(window.innerWidth, window.innerHeight);
flagCanvas.style.position = 'absolute';
flagCanvas.style.top = '0';
flagCanvas.style.left = '0';
flagCanvas.style.width = '100%';
flagCanvas.style.height = '100%';
renderer2.setPixelRatio(window.devicePixelRatio);

const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera2.position.z = 3;

const video = document.createElement('video');
video.src = 'videos/video.mp4';
video.loop = true;
video.muted = true;
video.playsInline = true;
video.autoplay = true;
video.setAttribute('playsinline', '');
video.setAttribute('muted', '');
video.setAttribute('autoplay', '');
video.setAttribute('loop', '');
video.style.display = 'none';
document.body.appendChild(video);

video.addEventListener('canplay', () => {
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  const geometry = new THREE.PlaneGeometry(2, 1.125, 100, 100);
  const material = new THREE.MeshBasicMaterial({ map: videoTexture });
  const flag = new THREE.Mesh(geometry, material);
  // initial offset will be updated in animate loop // podiže mesh da počne od vrha kad se skalira
  scene2.add(flag);

  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  const originalPositions = new Float32Array(positions.array);

  const proxy = { scale: 1 };

  ScrollTrigger.create({
    trigger: '.video-flag-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    // scroller: '#smooth-content',
    onUpdate: self => {
      proxy.scale = 1 + self.progress * 2.5;
    }
  });

  function animateFlag() {
    requestAnimationFrame(animateFlag);
    const time = performance.now() * 0.001;

    for (let i = 0; i < vertexCount; i++) {
      const ix = i * 3;
      const x = originalPositions[ix];
      const y = originalPositions[ix + 1];
      let wave = 0;
      if (proxy.scale > 1.01 && proxy.scale < 3.49) {
        wave = Math.sin(x * 3 + time * 3) * 0.05 + Math.sin(y * 5 + time * 2) * 0.05;
      }
      positions.array[ix + 2] = wave;
    }

    console.log('Scale:', proxy.scale);
    flag.scale.set(proxy.scale, proxy.scale, 1);
    flag.position.y = (1.125 * proxy.scale) / 2;
    camera2.position.z = 3 / proxy.scale;
    camera2.updateProjectionMatrix();

    positions.needsUpdate = true;
    renderer2.render(scene2, camera2);
  }
  animateFlag();

  video.play();
});

video.load();













