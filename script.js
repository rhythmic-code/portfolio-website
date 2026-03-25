/* ============================================
   STRANGER THINGS PORTFOLIO — SCRIPT.JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // AUDIO SYSTEM — MP3 Player
    // ============================================
    const audioToggle = document.getElementById('audio-toggle');
    const audioIconOn = document.getElementById('audio-icon-on');
    const audioIconOff = document.getElementById('audio-icon-off');
    const startOverlay = document.getElementById('audio-start-overlay');
    let audioPlaying = false;

    // Create audio element for MP3 playback
    const bgMusic = new Audio('assets/stranger-things-theme.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    function startAudio() {
        try {
            // Some browsers can throw synchronously; keep UI behavior consistent.
            bgMusic.play().catch(() => {});
        } catch (e) {}
        audioPlaying = true;
        if (audioToggle) {
            audioToggle.classList.remove('muted');
            if (audioIconOn) audioIconOn.style.display = 'block';
            if (audioIconOff) audioIconOff.style.display = 'none';
        }
        if (startOverlay) {
            startOverlay.classList.add('hidden');
            setTimeout(() => { startOverlay.remove(); }, 600);
        }
    }

    function toggleAudio() {
        if (audioPlaying) {
            bgMusic.pause();
            audioPlaying = false;
            if (audioToggle) {
                audioToggle.classList.add('muted');
                if (audioIconOn) audioIconOn.style.display = 'none';
                if (audioIconOff) audioIconOff.style.display = 'block';
            }
        } else {
            startAudio();
        }
    }

    if (startOverlay) {
        startOverlay.addEventListener('click', startAudio);
    }

    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }

    // ============================================
    // VINE / TENDRIL ANIMATION — VECNA-STYLE (S4 UPSIDE DOWN)
    // Thick crimson root-tendrils, slow horror ramp, heavy organic wrongness
    // ============================================
    const vineCanvas = document.getElementById('vine-canvas');
    if (vineCanvas) {
        const vCtx = vineCanvas.getContext('2d');
        let vines = [];
        const MAX_VINES = 4;
        const VINE_SPAWN_INTERVAL = 1400;
        const VINE_HORROR_RAMP_MS = 90000;
        const vineHorrorT0 = performance.now();

        function getVineHorrorRamp() {
            return Math.min(1, (performance.now() - vineHorrorT0) / VINE_HORROR_RAMP_MS);
        }

        /** Grows from ~0.78 → ~1.42 — vines swell and dominate the frame */
        function getVineThicknessScale() {
            return 0.78 + 0.64 * getVineHorrorRamp();
        }

        function resizeVineCanvas() {
            vineCanvas.width = window.innerWidth;
            vineCanvas.height = window.innerHeight;
        }
        resizeVineCanvas();
        window.addEventListener('resize', resizeVineCanvas);

        // Force spawn from the 4 corners only.
        let nextCornerIndex = 0;
        function getCornerSpawnPoint(cornerIndex) {
            const W = vineCanvas.width;
            const H = vineCanvas.height;
            const inset = 8;
            const angleJitter = 0.45;
            const corners = [
                { x: inset, y: inset, angle: Math.PI * 0.25 + (Math.random() - 0.5) * angleJitter }, // top-left
                { x: W - inset, y: inset, angle: Math.PI * 0.75 + (Math.random() - 0.5) * angleJitter }, // top-right
                { x: inset, y: H - inset, angle: -Math.PI * 0.25 + (Math.random() - 0.5) * angleJitter }, // bottom-left
                { x: W - inset, y: H - inset, angle: -Math.PI * 0.75 + (Math.random() - 0.5) * angleJitter }, // bottom-right
            ];
            return corners[cornerIndex % 4];
        }

        class Vine {
            constructor(cornerIndex = 0) {
                const spawn = getCornerSpawnPoint(cornerIndex);
                this.segments = [{ x: spawn.x, y: spawn.y }];
                this.angle = spawn.angle;
                // Heavy tendrils — slower, more deliberate crawl
                this.speed = 0.85 + Math.random() * 1.35;
                // Keep all 4 vines visually consistent.
                this.thickness = 18;
                this.maxLength = 520 + Math.floor(Math.random() * 520);
                this.growing = true;
                this.opacity = 0;
                this.targetOpacity = 0.5 + Math.random() * 0.28;
                this.branches = [];
                this.branchChance = 0.038;
                this.wobble = 0;
                this.wobbleSpeed = 0.011 + Math.random() * 0.022;
                this.life = 0;
                this.maxLife = 4200 + Math.random() * 2800;
                this.dying = false;
                this.pulsePhase = Math.random() * Math.PI * 2;
                // Near-black crimson, rust, infected flesh (Vecna / Mind Flayer hive)
                const colorVariant = Math.random();
                if (colorVariant < 0.35) {
                    this.r = 88 + Math.floor(Math.random() * 55);
                    this.g = 4 + Math.floor(Math.random() * 18);
                    this.b = 8 + Math.floor(Math.random() * 22);
                } else if (colorVariant < 0.65) {
                    this.r = 110 + Math.floor(Math.random() * 70);
                    this.g = 8 + Math.floor(Math.random() * 22);
                    this.b = 6 + Math.floor(Math.random() * 16);
                } else if (colorVariant < 0.88) {
                    this.r = 75 + Math.floor(Math.random() * 45);
                    this.g = 12 + Math.floor(Math.random() * 20);
                    this.b = 14 + Math.floor(Math.random() * 18);
                } else {
                    // Rare sickly highlight trunk
                    this.r = 140 + Math.floor(Math.random() * 50);
                    this.g = 18 + Math.floor(Math.random() * 25);
                    this.b = 22 + Math.floor(Math.random() * 20);
                }
                // Wet inner vein — dusty rose / arterial glint
                this.hr = Math.min(255, this.r + 55 + Math.floor(Math.random() * 45));
                this.hg = Math.min(255, this.g + 22 + Math.floor(Math.random() * 18));
                this.hb = Math.min(255, this.b + 18 + Math.floor(Math.random() * 15));
                this.thornSpacing = 6 + Math.floor(Math.random() * 5);
            }

            grow() {
                if (!this.growing) return;

                // Grow multiple segments per frame for fast crawling
                for (let step = 0; step < 3; step++) {
                    if (!this.growing) break;

                    this.wobble += this.wobbleSpeed;
                    const hr = getVineHorrorRamp();
                    const twitch = Math.sin(this.wobble * 5.1) * 0.028 * hr;
                    const wobbleOffset = Math.sin(this.wobble) * (0.1 + hr * 0.06)
                        + Math.sin(this.wobble * 2.7) * (0.045 + hr * 0.04) + twitch;
                    this.angle += wobbleOffset + (Math.random() - 0.5) * (0.045 + hr * 0.035);

                    const last = this.segments[this.segments.length - 1];
                    const nx = last.x + Math.cos(this.angle) * this.speed;
                    const ny = last.y + Math.sin(this.angle) * this.speed;

                    this.segments.push({ x: nx, y: ny });

                    if (this.segments.length >= this.maxLength) {
                        this.growing = false;
                    }

                    // More frequent branching with bigger branches
                    if (this.segments.length > 14 && Math.random() < this.branchChance && this.branches.length < 9) {
                        const branchAngle = this.angle + (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.95);
                        this.branches.push(new VineBranch(
                            nx, ny, branchAngle,
                            this.thickness * (0.38 + Math.random() * 0.34),
                            80 + Math.floor(Math.random() * 160),
                            this.r, this.g, this.b,
                            this.hr, this.hg, this.hb
                        ));
                    }
                } // end multi-step grow loop
            }

            update() {
                this.life++;
                this.pulsePhase += 0.03;
                if (this.opacity < this.targetOpacity && !this.dying) {
                    this.opacity += 0.008;
                }
                if (this.life > this.maxLife) {
                    this.dying = true;
                }
                if (this.dying) {
                    this.opacity -= 0.0015;
                }

                this.grow();
                this.branches.forEach(b => b.grow());
            }

            draw() {
                if (this.segments.length < 2) return;

                const hramp = getVineHorrorRamp();
                const tScale = getVineThicknessScale();
                const pulseVal = Math.sin(this.pulsePhase) * (0.12 + hramp * 0.14)
                    + Math.sin(this.pulsePhase * 2.3 + 1.1) * (0.06 + hramp * 0.08);

                vCtx.save();
                vCtx.globalAlpha = Math.max(0, this.opacity + pulseVal * (0.12 + hramp * 0.1));
                vCtx.lineCap = 'round';
                vCtx.lineJoin = 'round';

                const tracePath = (ctx, quad) => {
                    ctx.beginPath();
                    ctx.moveTo(this.segments[0].x, this.segments[0].y);
                    for (let i = 1; i < this.segments.length; i++) {
                        if (quad && i < this.segments.length - 1) {
                            const xc = (this.segments[i].x + this.segments[i + 1].x) / 2;
                            const yc = (this.segments[i].y + this.segments[i + 1].y) / 2;
                            ctx.quadraticCurveTo(this.segments[i].x, this.segments[i].y, xc, yc);
                        } else {
                            ctx.lineTo(this.segments[i].x, this.segments[i].y);
                        }
                    }
                };

                // Wide crimson bloom — hive-mind bleed into the room
                tracePath(vCtx, false);
                vCtx.lineWidth = (this.thickness + 28 + hramp * 22) * tScale;
                vCtx.strokeStyle = `rgba(${Math.min(255, this.r + 30)}, ${Math.floor(this.g * 0.35)}, ${Math.floor(this.b * 0.45)}, ${0.04 + hramp * 0.05})`;
                vCtx.stroke();

                tracePath(vCtx, false);
                vCtx.lineWidth = (this.thickness + 14 + hramp * 10) * tScale;
                vCtx.strokeStyle = `rgba(${this.r}, ${Math.floor(this.g * 0.4)}, ${Math.floor(this.b * 0.5)}, ${0.07 + hramp * 0.06})`;
                vCtx.stroke();

                // Core mass — near-black red
                tracePath(vCtx, true);
                const taperThickness = this.thickness * tScale * (1 + pulseVal * (0.28 + hramp * 0.15));
                vCtx.lineWidth = taperThickness;
                vCtx.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
                vCtx.stroke();

                // Subsurface shadow edge (depth)
                tracePath(vCtx, true);
                vCtx.lineWidth = taperThickness * 0.92;
                const dr = Math.max(0, this.r - 35);
                const dg = Math.max(0, this.g - 8);
                const db = Math.max(0, this.b - 10);
                vCtx.strokeStyle = `rgba(${dr}, ${dg}, ${db}, ${0.55 + hramp * 0.2})`;
                vCtx.stroke();

                // Inner vein — sick wet arterial glint
                tracePath(vCtx, true);
                const veinPulse = 0.28 + Math.sin(this.pulsePhase * 1.45) * (0.18 + hramp * 0.12)
                    + Math.sin(this.pulsePhase * 3.7) * 0.06 * hramp;
                vCtx.lineWidth = this.thickness * tScale * (0.22 + hramp * 0.06);
                vCtx.strokeStyle = `rgba(${this.hr}, ${this.hg}, ${this.hb}, ${veinPulse})`;
                vCtx.stroke();

                // Barbed ridges — larger on thick strands
                const thornBase = this.thickness * tScale;
                for (let i = this.thornSpacing; i < this.segments.length; i += this.thornSpacing) {
                    const seg = this.segments[i];
                    const prev = this.segments[i - 1];
                    if (seg && prev) {
                        const segAngle = Math.atan2(seg.y - prev.y, seg.x - prev.x);
                        const side = (i % (this.thornSpacing * 2) < this.thornSpacing) ? 1 : -1;
                        const thornAngle = segAngle + side * Math.PI * (0.38 + hramp * 0.08);
                        const thornLen = (5 + hramp * 6) + Math.random() * (thornBase * 0.75);
                        vCtx.beginPath();
                        vCtx.moveTo(seg.x, seg.y);
                        vCtx.lineTo(
                            seg.x + Math.cos(thornAngle) * thornLen,
                            seg.y + Math.sin(thornAngle) * thornLen
                        );
                        vCtx.lineWidth = (2.2 + hramp * 2) + Math.random() * 1.8;
                        vCtx.strokeStyle = `rgba(${Math.min(255, this.r + 45)}, ${this.g + 5}, ${this.b}, ${this.opacity * (0.75 + hramp * 0.2)})`;
                        vCtx.stroke();
                    }
                }

                // Bulbous growths — fleshy hive knots
                for (let i = 18; i < this.segments.length; i += 14 + Math.floor(Math.random() * 12)) {
                    const seg = this.segments[i];
                    if (seg) {
                        const nodeSize = (3.5 + hramp * 4) + Math.random() * (this.thickness * tScale * 0.55);
                        const nodePulse = Math.sin(this.pulsePhase + i * 0.12) * (0.35 + hramp * 0.2);
                        vCtx.beginPath();
                        vCtx.arc(seg.x, seg.y, Math.max(1.5, nodeSize * (1 + nodePulse)), 0, Math.PI * 2);
                        vCtx.fillStyle = `rgba(${Math.min(255, this.r + 35)}, ${Math.max(0, this.g - 8)}, ${Math.max(0, this.b - 8)}, ${this.opacity * (0.55 + hramp * 0.25)})`;
                        vCtx.fill();
                        vCtx.beginPath();
                        vCtx.arc(seg.x, seg.y, nodeSize * (0.35 + hramp * 0.08), 0, Math.PI * 2);
                        vCtx.fillStyle = `rgba(${this.hr}, ${Math.min(255, this.hg + 15)}, ${this.hb}, ${this.opacity * (0.35 + hramp * 0.2)})`;
                        vCtx.fill();
                    }
                }

                // Hooked tendril at tip — searching
                if (this.segments.length > 5) {
                    const tip = this.segments[this.segments.length - 1];
                    const tipPrev = this.segments[this.segments.length - 3];
                    if (tip && tipPrev) {
                        const tipAngle = Math.atan2(tip.y - tipPrev.y, tip.x - tipPrev.x);
                        vCtx.beginPath();
                        let cx = tip.x, cy = tip.y;
                        let curlAngle = tipAngle;
                        vCtx.moveTo(cx, cy);
                        const curlSteps = 14 + Math.floor(hramp * 6);
                        for (let c = 0; c < curlSteps; c++) {
                            curlAngle += 0.26 + hramp * 0.06;
                            const curlLen = (2.4 + hramp * 1.2) - c * (0.11 + hramp * 0.03);
                            if (curlLen <= 0) break;
                            cx += Math.cos(curlAngle) * curlLen;
                            cy += Math.sin(curlAngle) * curlLen;
                            vCtx.lineTo(cx, cy);
                        }
                        vCtx.lineWidth = (2 + hramp * 2.2) * Math.min(1.2, tScale * 0.85);
                        vCtx.strokeStyle = `rgba(${Math.min(255, this.r + 55)}, ${this.g + 12}, ${this.b + 8}, ${this.opacity * (0.65 + hramp * 0.25)})`;
                        vCtx.stroke();
                    }
                }

                this.branches.forEach(b => b.draw(vCtx, this.opacity, this.pulsePhase, tScale, hramp));

                vCtx.restore();
            }

            isDead() {
                return this.dying && this.opacity <= 0;
            }
        }

        class VineBranch {
            constructor(x, y, angle, thickness, maxLen, r, g, b, hr, hg, hb) {
                this.segments = [{ x, y }];
                this.angle = angle;
                this.speed = 0.7 + Math.random() * 0.8;
                this.thickness = thickness;
                this.maxLength = maxLen;
                this.growing = true;
                this.wobble = Math.random() * Math.PI * 2;
                this.r = r; this.g = g; this.b = b;
                this.hr = hr; this.hg = hg; this.hb = hb;
                this.subBranches = [];
                this.thornSpacing = 6 + Math.floor(Math.random() * 5);
            }

            grow() {
                if (!this.growing) return;
                // Grow 2 segments per frame for fast crawling
                for (let step = 0; step < 2; step++) {
                    if (!this.growing) break;
                    this.wobble += 0.025;
                    this.angle += Math.sin(this.wobble) * 0.12 + (Math.random() - 0.5) * 0.07;

                    const last = this.segments[this.segments.length - 1];
                    this.segments.push({
                        x: last.x + Math.cos(this.angle) * this.speed,
                        y: last.y + Math.sin(this.angle) * this.speed
                    });

                    if (this.segments.length >= this.maxLength) this.growing = false;

                } // end grow-step loop

                // Sub-branches for denser coverage
                if (this.segments.length > 15 && Math.random() < 0.012 && this.subBranches.length < 3) {
                    const subAngle = this.angle + (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.5);
                    const lastSeg = this.segments[this.segments.length - 1];
                    this.subBranches.push({
                        segments: [{ x: lastSeg.x, y: lastSeg.y }],
                        angle: subAngle,
                        speed: 0.25 + Math.random() * 0.3,
                        thickness: this.thickness * 0.5,
                        maxLength: 15 + Math.floor(Math.random() * 25),
                        growing: true,
                        wobble: Math.random() * Math.PI * 2
                    });
                }

                // Grow sub-branches
                this.subBranches.forEach(sb => {
                    if (!sb.growing) return;
                    sb.wobble += 0.03;
                    sb.angle += Math.sin(sb.wobble) * 0.1;
                    const slast = sb.segments[sb.segments.length - 1];
                    sb.segments.push({
                        x: slast.x + Math.cos(sb.angle) * sb.speed,
                        y: slast.y + Math.sin(sb.angle) * sb.speed
                    });
                    if (sb.segments.length >= sb.maxLength) sb.growing = false;
                });
            }

            draw(ctx, baseOpacity, parentPulse, tScale, hramp) {
                if (this.segments.length < 2) return;
                const pulse = Math.sin(parentPulse * 1.3) * (0.12 + hramp * 0.1);
                const tw = this.thickness * tScale;

                ctx.beginPath();
                ctx.moveTo(this.segments[0].x, this.segments[0].y);
                for (let i = 1; i < this.segments.length; i++) {
                    ctx.lineTo(this.segments[i].x, this.segments[i].y);
                }
                ctx.lineWidth = tw * (1 + pulse * 0.22) + 10 * hramp;
                ctx.strokeStyle = `rgba(${this.r}, ${Math.floor(this.g * 0.45)}, ${Math.floor(this.b * 0.55)}, ${0.06 + hramp * 0.07})`;
                ctx.globalAlpha = baseOpacity * 0.85;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.segments[0].x, this.segments[0].y);
                for (let i = 1; i < this.segments.length; i++) {
                    ctx.lineTo(this.segments[i].x, this.segments[i].y);
                }
                ctx.lineWidth = tw * (1 + pulse * 0.2);
                ctx.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
                ctx.globalAlpha = baseOpacity * 0.78;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.segments[0].x, this.segments[0].y);
                for (let i = 1; i < this.segments.length; i++) {
                    ctx.lineTo(this.segments[i].x, this.segments[i].y);
                }
                ctx.lineWidth = tw * (0.24 + hramp * 0.08);
                ctx.strokeStyle = `rgba(${this.hr}, ${this.hg}, ${this.hb}, ${0.22 + pulse * 0.12 + hramp * 0.1})`;
                ctx.globalAlpha = baseOpacity * 0.55;
                ctx.stroke();

                ctx.globalAlpha = baseOpacity * 0.78;

                for (let i = this.thornSpacing; i < this.segments.length; i += this.thornSpacing) {
                    const seg = this.segments[i];
                    const prev = this.segments[i - 1];
                    if (seg && prev) {
                        const sAngle = Math.atan2(seg.y - prev.y, seg.x - prev.x);
                        const side = (i % (this.thornSpacing * 2) < this.thornSpacing) ? 1 : -1;
                        const tAngle = sAngle + side * Math.PI * 0.45;
                        const tLen = (3 + hramp * 4) + Math.random() * (tw * 0.55);
                        ctx.beginPath();
                        ctx.moveTo(seg.x, seg.y);
                        ctx.lineTo(seg.x + Math.cos(tAngle) * tLen, seg.y + Math.sin(tAngle) * tLen);
                        ctx.lineWidth = 1.2 + hramp * 1.8;
                        ctx.strokeStyle = `rgba(${this.r + 35}, ${this.g}, ${this.b}, ${baseOpacity * (0.62 + hramp * 0.22)})`;
                        ctx.stroke();
                    }
                }

                const lastSeg = this.segments[this.segments.length - 1];
                if (this.segments.length > 8) {
                    ctx.beginPath();
                    let cx = lastSeg.x, cy = lastSeg.y;
                    let curlA = this.angle;
                    ctx.moveTo(cx, cy);
                    for (let c = 0; c < 12 + Math.floor(hramp * 4); c++) {
                        curlA += 0.32 + hramp * 0.05;
                        const cl = (2 + hramp) - c * (0.12 + hramp * 0.02);
                        if (cl <= 0) break;
                        cx += Math.cos(curlA) * cl;
                        cy += Math.sin(curlA) * cl;
                        ctx.lineTo(cx, cy);
                    }
                    ctx.lineWidth = 1.2 + hramp * 1.5;
                    ctx.strokeStyle = `rgba(${this.r + 40}, ${this.g + 8}, ${this.b}, ${baseOpacity * (0.58 + hramp * 0.22)})`;
                    ctx.stroke();
                }

                this.subBranches.forEach(sb => {
                    if (sb.segments.length < 2) return;
                    ctx.beginPath();
                    ctx.moveTo(sb.segments[0].x, sb.segments[0].y);
                    for (let i = 1; i < sb.segments.length; i++) {
                        ctx.lineTo(sb.segments[i].x, sb.segments[i].y);
                    }
                    ctx.lineWidth = sb.thickness * tScale;
                    ctx.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
                    ctx.globalAlpha = baseOpacity * (0.48 + hramp * 0.15);
                    ctx.stroke();
                });
            }
        }

        let vinePulse = 0;

        function animateVines() {
            vCtx.clearRect(0, 0, vineCanvas.width, vineCanvas.height);
            vinePulse += 0.0065;
            const hr = getVineHorrorRamp();
            const breath = Math.sin(vinePulse) * (0.07 + hr * 0.12);
            const arrhythmia = Math.sin(vinePulse * 2.17 + 0.8) * 0.04 * hr;
            const pulseAlpha = 1 + breath + arrhythmia;
            const opacityFloor = 0.52 + hr * 0.14;
            const opacityWobble = 0.1 + hr * 0.12;

            vines.forEach(v => {
                try {
                    v.update();
                    v.targetOpacity = (opacityFloor + Math.sin(vinePulse + v.pulsePhase) * opacityWobble) * pulseAlpha;
                    v.draw();
                } catch (e) {
                    // Prevent a single runtime error from killing the entire animation loop.
                    v.opacity = 0;
                    v.dying = true;
                }
            });

            // Remove dead vines
            vines = vines.filter(v => !v.isDead());

            requestAnimationFrame(animateVines);
        }

        // Spawn vines periodically
        function spawnVine() {
            if (vines.length < MAX_VINES) {
                vines.push(new Vine(nextCornerIndex));
                nextCornerIndex = (nextCornerIndex + 1) % 4;
            }
            setTimeout(spawnVine, VINE_SPAWN_INTERVAL + Math.random() * 1000);
        }

        for (let i = 0; i < 4; i++) {
            setTimeout(() => vines.push(new Vine(i)), i * 240);
        }

        animateVines();
        setTimeout(spawnVine, 1500);
    }

    // ============================================
    // PARTICLE SYSTEM
    // ============================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = Math.random() * 0.3 + 0.1;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.7 
                ? `rgba(215, 38, 49, ${this.opacity})` 
                : `rgba(255, 255, 255, ${this.opacity * 0.3})`;
            this.life = 0;
            this.maxLife = Math.random() * 300 + 100;
        }

        update() {
            this.x += this.speedX;
            this.y -= this.speedY;
            this.life++;

            if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
                this.y = canvas.height + 10;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ============================================
    // NAVBAR
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    function highlightNav() {
        const scrollPos = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[data-section="${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinkItems.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightNav);

    // ============================================
    // TYPEWRITER
    // ============================================
    const typewriterElement = document.getElementById('typewriter');
    const phrases = [
        'ENTERING THE UPSIDE DOWN...',
        'FULL-STACK DEVELOPER',
        'WELCOME TO HAWKINS',
        'FRIENDS DON\'T LIE',
        'CODE FROM THE OTHER SIDE'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }
    typeWriter();

    // ============================================
    // FLICKER EFFECT
    // ============================================
    const flickerOverlay = document.getElementById('flicker-overlay');
    function randomFlicker() {
        const shouldFlicker = Math.random() > 0.92;
        if (shouldFlicker) {
            flickerOverlay.classList.add('flicker-active');
            setTimeout(() => {
                flickerOverlay.classList.remove('flicker-active');
            }, 50 + Math.random() * 100);
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    flickerOverlay.classList.add('flicker-active');
                    setTimeout(() => {
                        flickerOverlay.classList.remove('flicker-active');
                    }, 30);
                }, 150);
            }
        }
        setTimeout(randomFlicker, 300 + Math.random() * 2000);
    }
    randomFlicker();

    // ============================================
    // ALPHABET WALL
    // ============================================
    const alphabetLetters = document.querySelectorAll('.alphabet-letter');
    const glowColors = ['#ff1744', '#ffd600', '#00e676', '#2979ff', '#e040fb', '#ff9100'];
    const messageToSpell = 'HELLO';
    let spellingIndex = 0;
    let isSpelling = false;

    function spellMessage() {
        if (spellingIndex < messageToSpell.length) {
            const letter = messageToSpell[spellingIndex].toLowerCase();
            const letterElement = document.querySelector(`.alphabet-letter[data-glow="${letter}"]`);
            if (letterElement) {
                const color = glowColors[Math.floor(Math.random() * glowColors.length)];
                letterElement.style.color = color;
                letterElement.style.textShadow = `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`;
                letterElement.classList.add('glow');

                setTimeout(() => {
                    letterElement.classList.remove('glow');
                    letterElement.style.color = '';
                    letterElement.style.textShadow = '';
                }, 1500);
            }
            spellingIndex++;
            setTimeout(spellMessage, 600);
        } else {
            spellingIndex = 0;
            setTimeout(spellMessage, 5000);
        }
    }

    const aboutSection = document.getElementById('about');
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isSpelling) {
                isSpelling = true;
                setTimeout(spellMessage, 1000);
            }
        });
    }, { threshold: 0.3 });
    aboutObserver.observe(aboutSection);

    function randomLetterTwinkle() {
        const randomLetter = alphabetLetters[Math.floor(Math.random() * alphabetLetters.length)];
        const color = glowColors[Math.floor(Math.random() * glowColors.length)];
        randomLetter.style.color = color;
        randomLetter.style.textShadow = `0 0 10px ${color}`;
        setTimeout(() => {
            randomLetter.style.color = '';
            randomLetter.style.textShadow = '';
        }, 300 + Math.random() * 700);
        setTimeout(randomLetterTwinkle, 500 + Math.random() * 2000);
    }
    randomLetterTwinkle();

    // ============================================
    // STAT COUNTER ANIMATION
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.getAttribute('data-count'));
                animateNumber(target, count);
                statObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statObserver.observe(stat));

    function animateNumber(element, target) {
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    }

    // ============================================
    // SKILL BAR ANIMATION
    // ============================================
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.getAttribute('data-width');
                fill.style.width = width + '%';
                skillObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(fill => skillObserver.observe(fill));

    // ============================================
    // REVEAL ON SCROLL
    // ============================================
    const revealElements = document.querySelectorAll(
        '.section-title, .section-subtitle, .skill-card, .about-text, .about-alphabet-wall, .contact-form, .contact-info, .about-stats'
    );
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                if (entry.target.classList.contains('skill-card')) {
                    const cards = document.querySelectorAll('.skill-card');
                    cards.forEach((card, i) => {
                        card.style.transitionDelay = `${i * 0.1}s`;
                    });
                }
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // PROJECT CARDS
    // ============================================
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.zIndex = '10';
        });
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '';
        });
    });

    // ============================================
    // CONTACT FORM
    // ============================================
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('.btn-submit');
        const originalText = btn.querySelector('.btn-text').textContent;
        btn.querySelector('.btn-text').textContent = 'TRANSMITTING...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btn.querySelector('.btn-text').textContent = 'MESSAGE RECEIVED ✓';
            btn.style.background = 'linear-gradient(135deg, #32e875, #00c853)';

            setTimeout(() => {
                btn.querySelector('.btn-text').textContent = originalText;
                btn.style.background = '';
                btn.style.pointerEvents = '';
                contactForm.reset();
            }, 3000);
        }, 2000);
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // FOCUS INPUT LABELS
    // ============================================
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('.form-label').style.color = '#d72631';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('.form-label').style.color = '';
        });
    });

    // ============================================
    // EASTER EGG — KONAMI CODE
    // ============================================
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.style.filter = 'invert(1) hue-rotate(180deg)';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 3000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

});
