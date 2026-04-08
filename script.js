// ═══════════════════════════════════════════════════
    // Campus Pulse — Auto Time + Climate Theme Engine
    // ═══════════════════════════════════════════════════
    const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
    const LIVE_API = '/api/live';
    const DEFAULT_LAT = 17.385;
    const DEFAULT_LON = 78.4867;

    let chart = null;
    let autoMode = true;
    let liveMode = false;
    let currentWeather = null;
    let userCoords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
    let lastAutoTheme = null;

    const scenarios = {
      pleasant: {
        temp: 26, hum: 55, pres: 1015, rain: 'No', light: 720, disc: 22, feels: 25,
        title: 'Pleasant', sub: 'Clear skies — great day to be outside', alert: null,
        humSub: 'Comfortable', presSub: 'Stable', rainSub: 'No rain detected', lightSub: 'Bright daylight',
        discLevel: 'Comfortable', discText: 'Ideal conditions — no heat stress',
        report: 'Campus temperature is a comfortable 26°C with moderate humidity at 55%. Pressure is stable at 1015 hPa. Great conditions for outdoor activities.',
        trend: [23, 22, 22, 23, 24, 25, 26, 27, 27, 26, 25, 24], theme: 'pleasant'
      },
      hot: {
        temp: 41, hum: 28, pres: 1008, rain: 'No', light: 950, disc: 36, feels: 44,
        title: 'Extreme heat', sub: 'Stay hydrated — avoid outdoor exposure',
        alert: 'Heat advisory in effect. Avoid outdoor activity between 11am – 4pm.',
        humSub: 'Very dry air', presSub: 'Slight drop', rainSub: 'No rain', lightSub: 'Intense sunlight',
        discLevel: 'Dangerous', discText: 'Extreme heat stress — seek shade and hydration immediately',
        report: 'Campus is experiencing dangerous heat at 41°C. Feels-like 44°C. UV exposure is extreme. Postpone all outdoor activities.',
        trend: [32, 33, 35, 37, 38, 40, 41, 41, 40, 38, 36, 34], theme: 'hot'
      },
      rain: {
        temp: 23, hum: 90, pres: 997, rain: 'Yes', light: 180, disc: 26, feels: 22,
        title: 'Rainy', sub: 'Moderate rainfall — carry an umbrella', alert: null,
        humSub: 'Very humid', presSub: 'Low — rain likely', rainSub: 'Active rainfall', lightSub: 'Overcast',
        discLevel: 'Moderate', discText: 'Humidity is high — feels muggy indoors too',
        report: 'Active rainfall on campus. Humidity 90%, pressure 997 hPa. Rain expected for 2–3 more hours.',
        trend: [26, 26, 25, 24, 24, 23, 23, 23, 23, 24, 24, 25], theme: 'rain'
      },
      night: {
        temp: 21, hum: 68, pres: 1014, rain: 'No', light: 5, disc: 18, feels: 20,
        title: 'Clear night', sub: 'Cool and calm — good visibility', alert: null,
        humSub: 'Moderate', presSub: 'Stable', rainSub: 'Dry', lightSub: 'Nighttime',
        discLevel: 'Very comfortable', discText: 'Cool night — light jacket recommended',
        report: 'Campus is calm tonight at 21°C under clear skies. Perfect for late-night study or relaxation.',
        trend: [28, 27, 25, 24, 23, 22, 21, 20, 19, 19, 20, 21], theme: 'night'
      },
      cold: {
        temp: 11, hum: 74, pres: 1024, rain: 'No', light: 320, disc: 10, feels: 8,
        title: 'Cold', sub: 'Unusually chilly — dress warmly', alert: null,
        humSub: 'Moderate', presSub: 'High — dry and stable', rainSub: 'No rain', lightSub: 'Pale sunlight',
        discLevel: 'Cold', discText: 'Wind chill makes it feel colder — layer up',
        report: 'Unusually cold at 11°C, feels like 8°C. Warm clothing essential. Max 14°C today.',
        trend: [9, 9, 10, 11, 12, 13, 14, 13, 12, 12, 11, 10], theme: 'cold'
      },
      storm: {
        temp: 20, hum: 97, pres: 983, rain: 'Yes', light: 40, disc: 28, feels: 19,
        title: 'Thunderstorm', sub: 'Dangerous — stay indoors immediately',
        alert: 'Severe thunderstorm warning. All outdoor activities suspended.',
        humSub: 'Saturated', presSub: 'Very low — severe storm', rainSub: 'Heavy rainfall', lightSub: 'Very dark',
        discLevel: 'Dangerous', discText: 'Severe weather event in progress — do not go outside',
        report: 'SEVERE ALERT: Pressure 983 hPa — thunderstorm in progress. Stay in buildings away from windows.',
        trend: [27, 26, 24, 23, 22, 21, 20, 20, 20, 21, 22, 24], theme: 'storm'
      },
      dawn: {
        temp: 19, hum: 72, pres: 1013, rain: 'No', light: 120, disc: 16, feels: 18,
        title: 'Sunrise', sub: 'A new day begins — golden light on campus', alert: null,
        humSub: 'Cool moisture', presSub: 'Stable', rainSub: 'Dry', lightSub: 'First light',
        discLevel: 'Very comfortable', discText: 'Cool morning air — perfect for a walk',
        report: 'The sun is rising. Temperature is a cool 19°C with 72% humidity. Fresh and crisp — ideal for early activities.',
        trend: [17, 17, 17, 18, 19, 20, 22, 24, 26, 27, 28, 27], theme: 'dawn'
      },
      dusk: {
        temp: 27, hum: 52, pres: 1012, rain: 'No', light: 210, disc: 24, feels: 26,
        title: 'Sunset', sub: 'Golden hour — the sky is ablaze', alert: null,
        humSub: 'Comfortable', presSub: 'Stable', rainSub: 'Dry', lightSub: 'Fading light',
        discLevel: 'Comfortable', discText: 'Cooling down — pleasant evening ahead',
        report: 'Sunset paints the campus sky. Temperature settling at 27°C. Perfect for an evening stroll.',
        trend: [24, 26, 28, 30, 31, 31, 30, 29, 28, 27, 25, 23], theme: 'dusk'
      },
      foggy: {
        temp: 18, hum: 92, pres: 1010, rain: 'No', light: 150, disc: 19, feels: 17,
        title: 'Foggy', sub: 'Low visibility — proceed with caution', alert: null,
        humSub: 'Very humid', presSub: 'Normal', rainSub: 'Moist air', lightSub: 'Dim and hazy',
        discLevel: 'Comfortable', discText: 'Cool and misty conditions',
        report: 'Campus is wrapped in fog at 18°C with very high humidity. Visibility is reduced to ~100m. Pedestrians advised to use caution.',
        trend: [16, 16, 17, 18, 18, 18, 17, 17, 16, 16, 15, 15], theme: 'foggy'
      },
      snow: {
        temp: 3, hum: 65, pres: 1018, rain: 'No', light: 280, disc: 2, feels: 0,
        title: 'Snowfall', sub: 'Winter wonderland — stay warm', alert: 'Roads may be slippery. Wear appropriate footwear.',
        humSub: 'Moderate', presSub: 'High — stable', rainSub: 'Light snow', lightSub: 'Pale snow-lit',
        discLevel: 'Very cold', discText: 'Severe cold — hypothermia risk with prolonged exposure',
        report: 'Fresh snow on campus at 3°C. Beautiful winter conditions but require heavy winter gear. Classes operating normally.',
        trend: [2, 2, 3, 4, 4, 3, 2, 2, 1, 1, 0, 0], theme: 'snow'
      },
      haze: {
        temp: 32, hum: 48, pres: 1005, rain: 'No', light: 500, disc: 28, feels: 33,
        title: 'Hazy', sub: 'Air quality degraded — limit outdoor exposure',
        alert: 'Air quality index is poor. Sensitive groups avoid outdoor activities.',
        humSub: 'Dry', presSub: 'Low — unstable', rainSub: 'No rain', lightSub: 'Polluted air',
        discLevel: 'Moderate', discText: 'Heat and poor air quality — stay cool indoors',
        report: 'Campus visibility reduced by haze at 32°C. Air quality is degraded. Wear N95 masks if outdoors. UV protection essential.',
        trend: [28, 29, 30, 31, 32, 32, 31, 30, 30, 29, 29, 28], theme: 'haze'
      },
      partly: {
        temp: 25, hum: 60, pres: 1016, rain: 'No', light: 580, disc: 21, feels: 24,
        title: 'Partly cloudy', sub: 'Mixed conditions — great for outdoor plans', alert: null,
        humSub: 'Comfortable', presSub: 'Stable', rainSub: 'No rain expected', lightSub: 'Partly sunny',
        discLevel: 'Comfortable', discText: 'Pleasant conditions throughout the day',
        report: 'Many clouds but plenty of sunshine at 25°C. Humidity 60% and pressure stable. Good day for campus events.',
        trend: [22, 22, 23, 24, 25, 25, 25, 25, 24, 24, 23, 22], theme: 'partly'
      },
      windy: {
        temp: 22, hum: 55, pres: 1008, rain: 'No', light: 620, disc: 20, feels: 18,
        title: 'Windy', sub: 'Strong gusts — hold onto your items', alert: null,
        humSub: 'Comfortable', presSub: 'Dropping', rainSub: 'No rain', lightSub: 'Bright with gusts',
        discLevel: 'Comfortable', discText: 'Wind makes it feel cooler than actual temp',
        report: 'Sustained winds at 22 km/h with gusts up to 35 km/h. Hold loose items. Temperature 22°C feels like 18°C.',
        trend: [20, 20, 21, 21, 22, 22, 22, 21, 21, 20, 20, 19], theme: 'windy'
      },
      humid: {
        temp: 24, hum: 85, pres: 1012, rain: 'No', light: 650, disc: 27, feels: 25,
        title: 'Humid', sub: 'Sticky conditions — stay hydrated', alert: null,
        humSub: 'Very humid', presSub: 'Normal', rainSub: 'Potential rain', lightSub: 'Bright but hazy',
        discLevel: 'Moderate', discText: 'High humidity increases discomfort — monitor heat stress',
        report: 'Exceptionally humid at 85% with 24°C temperature. Feels like 25°C. Expect afternoon thundershowers possible.',
        trend: [22, 22, 23, 23, 24, 24, 24, 23, 23, 22, 22, 21], theme: 'humid'
      }
    };

    // ─── IST Time ───
    function getISTDate() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      return new Date(utc + 5.5 * 3600000);
    }

    function updateClock() {
      const ist = getISTDate();
      const h = String(ist.getHours()).padStart(2, '0');
      const m = String(ist.getMinutes()).padStart(2, '0');
      document.getElementById('time-badge').textContent = h + ':' + m + ' IST';
      if (autoMode) applyAutoTheme();
    }

    // ─── Time Period ───
    function getTimePeriod(ist) {
      const t = ist.getHours() + ist.getMinutes() / 60;
      if (t >= 5 && t < 6.5) return 'dawn';
      if (t >= 6.5 && t < 16) return 'day';
      if (t >= 16 && t < 17.5) return 'golden';
      if (t >= 17.5 && t < 19.5) return 'dusk';
      return 'night';
    }

    // ─── Weather Code ───
    function interpretWeatherCode(code) {
      if (code >= 95) return { cond: 'storm', label: 'Thunderstorm', rain: 'Yes' };
      if (code >= 80) return { cond: 'rain', label: 'Rain showers', rain: 'Yes' };
      if (code >= 71) return { cond: 'snow', label: 'Snowfall', rain: 'No' };
      if (code >= 61) return { cond: 'rain', label: 'Rainy', rain: 'Yes' };
      if (code >= 51) return { cond: 'drizzle', label: 'Drizzle', rain: 'Yes' };
      if (code >= 45) return { cond: 'fog', label: 'Foggy', rain: 'No' };
      if (code >= 3) return { cond: 'cloudy', label: 'Overcast', rain: 'No' };
      if (code >= 1) return { cond: 'partly', label: 'Partly cloudy', rain: 'No' };
      return { cond: 'clear', label: 'Clear sky', rain: 'No' };
    }

    // ─── Determine Theme ───
    function determineTheme(ist, w) {
      const p = getTimePeriod(ist);
      if (w) {
        const wx = interpretWeatherCode(w.weatherCode);
        if (wx.cond === 'storm') return 'storm';
        if (wx.cond === 'rain' || wx.cond === 'drizzle') return 'rain';
        if (wx.cond === 'snow' || w.temp < 10) return 'cold';
        if (w.temp > 38 && (p === 'day' || p === 'golden')) return 'hot';
        if (p === 'dawn') return 'dawn';
        if (p === 'dusk') return 'dusk';
        if (p === 'night') return 'night';
        if (w.temp > 35) return 'hot';
        if (w.temp < 15) return 'cold';
        return 'pleasant';
      }
      if (p === 'dawn') return 'dawn';
      if (p === 'dusk') return 'dusk';
      if (p === 'night') return 'night';
      return 'pleasant';
    }

    // ─── Build live data from API ───
    function buildLiveData(w, theme) {
      const ist = getISTDate();
      const wx = interpretWeatherCode(w.weatherCode);
      const disc = w.temp - 0.55 * (1 - w.humidity / 100) * (w.temp - 14.5);
      const feels = Math.round(w.temp + (w.humidity > 70 ? 2 : 0) - (w.temp < 15 ? 2 : 0));
      const p = getTimePeriod(ist);
      let ll, ls;
      if (p === 'night') { ll = 5; ls = 'Nighttime'; } else if (p === 'dawn') { ll = 120; ls = 'First light'; }
      else if (p === 'dusk') { ll = 210; ls = 'Fading light'; } else if (w.cloud > 80) { ll = 180; ls = 'Overcast'; }
      else if (w.cloud > 50) { ll = 450; ls = 'Partly cloudy'; } else { ll = 750; ls = 'Bright daylight'; }
      const tl = ist.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      let title = wx.label;
      if (wx.cond === 'clear' && p === 'dawn') title = 'Sunrise';
      if (wx.cond === 'clear' && p === 'dusk') title = 'Sunset';
      if (wx.cond === 'clear' && p === 'night') title = 'Clear night';
      return {
        temp: Math.round(w.temp * 10) / 10, hum: Math.round(w.humidity), pres: Math.round(w.pressure),
        rain: wx.rain, light: ll, disc: Math.round(disc * 10) / 10, feels,
        title, sub: `Live weather · ${tl} IST`,
        alert: disc > 33 ? 'High discomfort — limit outdoor exposure.' : (wx.cond === 'storm' ? 'Severe weather — stay indoors.' : null),
        humSub: w.humidity > 80 ? 'Very humid' : w.humidity > 60 ? 'Humid' : 'Comfortable',
        presSub: w.pressure < 995 ? 'Low — rain likely' : w.pressure > 1020 ? 'High — stable' : 'Normal',
        rainSub: wx.rain === 'Yes' ? 'Active rainfall' : 'No rain detected', lightSub: ls,
        discLevel: disc > 30 ? 'Dangerous' : disc > 22 ? 'Moderate' : 'Comfortable',
        discText: disc > 30 ? 'Avoid prolonged outdoor exposure' : disc > 22 ? 'Moderate strain in sun' : 'Ideal conditions',
        report: `Live: ${Math.round(w.temp)}°C, ${Math.round(w.humidity)}% humidity, ${Math.round(w.pressure)} hPa. ${wx.label}. Wind ${w.wind} km/h. Cloud ${w.cloud}%. Updated ${tl} IST.`,
        trend: w.hourly || Array(12).fill(0).map(() => Math.round(w.temp + (Math.random() - 0.5) * 4)),
        theme
      };
    }

    // ─── Fetch Weather (Open-Meteo, free, no key) ───
    async function fetchWeather() {
      try {
        const url = `${OPEN_METEO}?latitude=${userCoords.lat}&longitude=${userCoords.lon}` +
          `&current=temperature_2m,relative_humidity_2m,surface_pressure,rain,weather_code,cloud_cover,wind_speed_10m` +
          `&hourly=temperature_2m&timezone=Asia/Kolkata&forecast_days=1`;
        const res = await fetch(url);
        if (!res.ok) return;
        const d = await res.json();
        const c = d.current;
        const ht = d.hourly?.temperature_2m || [];
        const step = Math.floor(ht.length / 12) || 1;
        const trend = [];
        for (let i = 0; i < 12 && i * step < ht.length; i++) trend.push(Math.round(ht[i * step]));
        currentWeather = {
          temp: c.temperature_2m, humidity: c.relative_humidity_2m, pressure: c.surface_pressure,
          rain: c.rain, weatherCode: c.weather_code, cloud: c.cloud_cover, wind: c.wind_speed_10m,
          hourly: trend.length >= 12 ? trend : undefined
        };
        document.getElementById('api-dot').className = 'api-dot live';
        document.getElementById('api-label').textContent = 'Live weather · auto-updating every 10 min';
        if (autoMode) applyAutoTheme();
      } catch (e) {
        console.log('Weather fetch failed:', e);
        if (autoMode) applyAutoTheme();
      }
    }

    // ─── Auto Theme ───
    function applyAutoTheme() {
      if (!autoMode) return;
      const ist = getISTDate();
      const theme = determineTheme(ist, currentWeather);
      if (theme === lastAutoTheme) return;
      lastAutoTheme = theme;
      if (currentWeather) {
        applyData(buildLiveData(currentWeather, theme));
      } else {
        applyData(scenarios[theme] || scenarios.pleasant);
      }
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      const ab = document.getElementById('btn-auto');
      if (ab) ab.classList.add('active');
    }

    function enableAutoMode() {
      autoMode = true; liveMode = false; lastAutoTheme = null;
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      const ab = document.getElementById('btn-auto');
      if (ab) ab.classList.add('active');
      applyAutoTheme();
    }

    function setScenario(name, btn) {
      autoMode = false; liveMode = false; lastAutoTheme = null;
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      applyData(scenarios[name]);
    }

    // ─── Sky Effects ───
    function drawSkyEffects(s) {
      const overlay = document.getElementById('sky-overlay');
      overlay.innerHTML = '';

      // Stars
      if (['night', 'storm', 'dawn', 'dusk'].includes(s.theme)) {
        const ct = s.theme === 'night' ? 80 : s.theme === 'storm' ? 20 : 12;
        const maxY = s.theme === 'dawn' || s.theme === 'dusk' ? 40 : 65;
        const maxOp = s.theme === 'dawn' || s.theme === 'dusk' ? 0.35 : 1;
        for (let i = 0; i < ct; i++) {
          const star = document.createElement('div');
          star.className = 'star';
          const sz = Math.random() * 2.5 + 0.5;
          star.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random() * maxY}%;left:${Math.random() * 100}%;animation-delay:${Math.random() * 4}s;animation-duration:${1.5 + Math.random() * 2.5}s;opacity:${0.2 + Math.random() * maxOp}`;
          overlay.appendChild(star);
        }
      }

      // Lightning
      if (s.theme === 'storm') {
        const fl = document.createElement('div');
        fl.className = 'lightning'; overlay.appendChild(fl);
      }

      // Rain
      if (s.rain === 'Yes') {
        const ct = s.theme === 'storm' ? 100 : 50;
        for (let i = 0; i < ct; i++) {
          const d = document.createElement('div'); d.className = 'raindrop';
          const h = 10 + Math.random() * 20, dur = 0.4 + Math.random() * 0.6;
          d.style.cssText = `height:${h}px;left:${Math.random() * 110 - 5}%;animation-duration:${dur}s;animation-delay:${Math.random() * 2}s;opacity:${0.3 + Math.random() * 0.5};`;
          overlay.appendChild(d);
        }
      }

      // Snow
      if (s.theme === 'cold') {
        for (let i = 0; i < 20; i++) {
          const sf = document.createElement('div'); sf.className = 'snowflake'; sf.textContent = '❄';
          sf.style.cssText = `left:${Math.random() * 100}%;animation-duration:${4 + Math.random() * 6}s;animation-delay:${Math.random() * 5}s;font-size:${8 + Math.random() * 8}px;`;
          overlay.appendChild(sf);
        }
      }

      // Horizon glow for dawn/dusk
      if (s.theme === 'dawn' || s.theme === 'dusk') {
        const glow = document.createElement('div');
        const c = s.theme === 'dawn'
          ? 'radial-gradient(ellipse 130% 100% at 50% 100%, rgba(255,170,50,0.4) 0%, rgba(255,120,80,0.18) 40%, transparent 70%)'
          : 'radial-gradient(ellipse 130% 100% at 50% 100%, rgba(255,100,30,0.45) 0%, rgba(200,50,80,0.2) 40%, transparent 70%)';
        glow.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:50%;background:${c};pointer-events:none;`;
        overlay.appendChild(glow);
      }

      // Clouds
      if (['pleasant', 'rain', 'cold', 'dawn', 'dusk'].includes(s.theme)) {
        const ct = s.theme === 'rain' ? 4 : 2;
        for (let i = 0; i < ct; i++) {
          const wrap = document.createElement('div'); wrap.className = 'cloud-wrap';
          const top = 5 + Math.random() * 20, scale = 0.6 + Math.random() * 0.8, dur = 40 + Math.random() * 40, delay = Math.random() * -30;
          wrap.style.cssText = `top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s;transform:scale(${scale});`;
          let fill;
          if (s.theme === 'rain') fill = 'rgba(100,110,130,0.7)';
          else if (s.theme === 'dawn') fill = 'rgba(255,200,150,0.6)';
          else if (s.theme === 'dusk') fill = 'rgba(255,160,100,0.55)';
          else fill = 'rgba(255,255,255,0.75)';
          wrap.innerHTML = `<svg width="140" height="60" viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="38" r="22" fill="${fill}"/><circle cx="72" cy="28" r="20" fill="${fill}"/>
        <circle cx="92" cy="35" r="18" fill="${fill}"/><circle cx="38" cy="42" r="15" fill="${fill}"/>
        <circle cx="105" cy="40" r="14" fill="${fill}"/><rect x="24" y="38" width="96" height="22" rx="4" fill="${fill}"/>
      </svg>`;
          overlay.appendChild(wrap);
        }
      }
    }

    // ─── Weather Icon ───
    function drawWeatherIcon(s) {
      const svg = document.getElementById('weather-svg');
      const ns = 'http://www.w3.org/2000/svg';
      svg.innerHTML = '';
      const cx = 28, cy = 28;

      if (s.theme === 'dawn' || s.theme === 'dusk') {
        const sunY = s.theme === 'dawn' ? 38 : 40;
        const color = s.theme === 'dawn' ? '#FFD060' : '#FF7830';
        const id = s.theme + '-clip';
        const defs = document.createElementNS(ns, 'defs');
        const clip = document.createElementNS(ns, 'clipPath'); clip.setAttribute('id', id);
        const cr = document.createElementNS(ns, 'rect');
        cr.setAttribute('x', 0); cr.setAttribute('y', 0); cr.setAttribute('width', 56); cr.setAttribute('height', sunY);
        clip.appendChild(cr); defs.appendChild(clip); svg.appendChild(defs);
        // horizon
        const hl = document.createElementNS(ns, 'line');
        hl.setAttribute('x1', 6); hl.setAttribute('y1', sunY); hl.setAttribute('x2', 50); hl.setAttribute('y2', sunY);
        hl.setAttribute('stroke', 'rgba(255,200,100,0.4)'); hl.setAttribute('stroke-width', '1'); svg.appendChild(hl);
        // sun
        const sun = document.createElementNS(ns, 'circle');
        sun.setAttribute('cx', cx); sun.setAttribute('cy', sunY); sun.setAttribute('r', '13');
        sun.setAttribute('fill', color); sun.setAttribute('clip-path', `url(#${id})`); svg.appendChild(sun);
        // rays
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI / 6) * (i - 2);
          const r = document.createElementNS(ns, 'line');
          r.setAttribute('x1', cx + Math.cos(a - Math.PI / 2) * 16); r.setAttribute('y1', sunY + Math.sin(a - Math.PI / 2) * 16);
          r.setAttribute('x2', cx + Math.cos(a - Math.PI / 2) * 22); r.setAttribute('y2', sunY + Math.sin(a - Math.PI / 2) * 22);
          r.setAttribute('stroke', color); r.setAttribute('stroke-width', '2'); r.setAttribute('stroke-linecap', 'round');
          svg.appendChild(r);
        }
      } else if (s.theme === 'pleasant') {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2; const l = document.createElementNS(ns, 'line');
          l.setAttribute('x1', cx + Math.cos(a) * 18); l.setAttribute('y1', cy + Math.sin(a) * 18);
          l.setAttribute('x2', cx + Math.cos(a) * 24); l.setAttribute('y2', cy + Math.sin(a) * 24);
          l.setAttribute('stroke', '#FFD700'); l.setAttribute('stroke-width', '2.5'); l.setAttribute('stroke-linecap', 'round');
          svg.appendChild(l);
        }
        const sun = document.createElementNS(ns, 'circle');
        sun.setAttribute('cx', cx); sun.setAttribute('cy', cy); sun.setAttribute('r', '13');
        sun.setAttribute('fill', '#FFD700'); svg.appendChild(sun);
      } else if (s.theme === 'hot') {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2; const l = document.createElementNS(ns, 'line');
          l.setAttribute('x1', cx + Math.cos(a) * 18); l.setAttribute('y1', cy + Math.sin(a) * 18);
          l.setAttribute('x2', cx + Math.cos(a) * 26); l.setAttribute('y2', cy + Math.sin(a) * 26);
          l.setAttribute('stroke', '#FF6B00'); l.setAttribute('stroke-width', '3'); l.setAttribute('stroke-linecap', 'round');
          svg.appendChild(l);
        }
        const sun = document.createElementNS(ns, 'circle');
        sun.setAttribute('cx', cx); sun.setAttribute('cy', cy); sun.setAttribute('r', '14');
        sun.setAttribute('fill', '#FF8C00'); svg.appendChild(sun);
        const gl = document.createElementNS(ns, 'circle');
        gl.setAttribute('cx', cx); gl.setAttribute('cy', cy); gl.setAttribute('r', '14');
        gl.setAttribute('fill', 'none'); gl.setAttribute('stroke', 'rgba(255,200,0,0.4)'); gl.setAttribute('stroke-width', '4');
        svg.appendChild(gl);
      } else if (s.theme === 'night') {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', 'M 40 12 A 16 16 0 1 1 40 44 A 11 11 0 1 0 40 12');
        p.setAttribute('fill', '#E8E8C8'); svg.appendChild(p);
        [[12, 14], [18, 8], [8, 24], [20, 28]].forEach(([x, y]) => {
          const s2 = document.createElementNS(ns, 'circle');
          s2.setAttribute('cx', x); s2.setAttribute('cy', y); s2.setAttribute('r', '1.5');
          s2.setAttribute('fill', 'white'); svg.appendChild(s2);
        });
      } else if (s.theme === 'cold') {
        [[28, 6, 28, 50], [6, 28, 50, 28], [11, 11, 45, 45], [45, 11, 11, 45]].forEach(([x1, y1, x2, y2]) => {
          const l = document.createElementNS(ns, 'line');
          l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
          l.setAttribute('stroke', 'rgba(200,230,255,0.85)'); l.setAttribute('stroke-width', '2'); l.setAttribute('stroke-linecap', 'round');
          svg.appendChild(l);
        });
        [[28, 6], [28, 50], [6, 28], [50, 28], [11, 11], [45, 45], [45, 11], [11, 45]].forEach(([x, y]) => {
          const c = document.createElementNS(ns, 'circle');
          c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', '2.5'); c.setAttribute('fill', 'rgba(220,240,255,0.9)');
          svg.appendChild(c);
        });
        const cc = document.createElementNS(ns, 'circle');
        cc.setAttribute('cx', '28'); cc.setAttribute('cy', '28'); cc.setAttribute('r', '4'); cc.setAttribute('fill', 'white');
        svg.appendChild(cc);
      } else {
        const cf = s.theme === 'storm' ? '#4A5568' : '#90A0B0';
        [[28, 22, 16], [38, 17, 12], [18, 18, 11], [30, 14, 10]].forEach(([x, y, r]) => {
          const c = document.createElementNS(ns, 'circle');
          c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.setAttribute('fill', cf);
          svg.appendChild(c);
        });
        if (s.theme === 'storm') {
          const b = document.createElementNS(ns, 'polyline');
          b.setAttribute('points', '32,34 28,44 31,44 26,54');
          b.setAttribute('stroke', '#FFE500'); b.setAttribute('stroke-width', '2.5');
          b.setAttribute('fill', 'none'); b.setAttribute('stroke-linecap', 'round'); b.setAttribute('stroke-linejoin', 'round');
          svg.appendChild(b);
        } else {
          [[22, 38], [29, 42], [37, 38]].forEach(([x, y]) => {
            const l = document.createElementNS(ns, 'line');
            l.setAttribute('x1', x); l.setAttribute('y1', y); l.setAttribute('x2', x - 3); l.setAttribute('y2', y + 8);
            l.setAttribute('stroke', 'rgba(150,190,230,0.9)'); l.setAttribute('stroke-width', '2'); l.setAttribute('stroke-linecap', 'round');
            svg.appendChild(l);
          });
        }
      }
    }

    // ─── Chart ───
    function drawChart(trend) {
      const ctx = document.getElementById('tempChart').getContext('2d');
      const labels = ['6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p'];
      const min = Math.min(...trend), max = Math.max(...trend);
      document.getElementById('chart-range').textContent = min + '° – ' + max + '°';
      if (chart) { chart.destroy(); }
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels, datasets: [{
            data: trend, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 2, pointBackgroundColor: 'rgba(255,255,255,0.9)', pointRadius: 3, pointHoverRadius: 5, tension: 0.4, fill: true
          }]
        },
        options: {
          responsive: true, plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
            y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 }, callback: v => v + '°' }, grid: { color: 'rgba(255,255,255,0.07)' }, border: { display: false } }
          }
        }
      });
    }

    // ─── Apply Data ───
    function applyData(data) {
      document.getElementById('val-temp').textContent = data.temp;
      document.getElementById('val-hum').textContent = data.hum;
      document.getElementById('val-pres').textContent = data.pres;
      document.getElementById('val-rain').textContent = data.rain === 'Yes' ? 'Raining 🌧' : 'Dry ✓';
      document.getElementById('val-light').textContent = data.light;
      document.getElementById('val-disc').textContent = typeof data.disc === 'number' ? data.disc.toFixed(1) : data.disc;
      document.getElementById('val-feels').textContent = data.feels;
      document.getElementById('condition-title').textContent = data.title;
      document.getElementById('condition-sub').textContent = data.sub;
      document.getElementById('hum-sub').textContent = data.humSub;
      document.getElementById('pres-sub').textContent = data.presSub;
      document.getElementById('rain-sub').textContent = data.rainSub;
      document.getElementById('light-sub').textContent = data.lightSub;
      document.getElementById('disc-level').textContent = '— ' + data.discLevel;
      document.getElementById('disc-text').textContent = data.discText;
      document.getElementById('report-text').textContent = data.report;
      const pct = Math.min(100, (data.disc / 40) * 100);
      const bc = data.disc > 30 ? '#FF6B6B' : data.disc > 22 ? '#FBBF24' : '#4ADE80';
      document.getElementById('disc-bar').style.width = pct + '%';
      document.getElementById('disc-bar').style.background = bc;
      const al = document.getElementById('alert-banner');
      if (data.alert) { al.classList.add('show'); document.getElementById('alert-text').textContent = data.alert; }
      else { al.classList.remove('show'); }
      document.body.className = 'theme-' + data.theme;
      drawSkyEffects(data); drawWeatherIcon(data); drawChart(data.trend);
    }

    // ─── Init ───
    updateClock();
    setInterval(updateClock, 30000);

    // Try browser geolocation, then fetch weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }; fetchWeather(); },
        () => fetchWeather()
      );
    } else { fetchWeather(); }

    // Apply time-based theme immediately (before weather loads)
    applyAutoTheme();

    // Re-fetch weather every 10 minutes
    setInterval(fetchWeather, 600000);

    // Also try the local sensor API
    async function fetchLive() {
      try {
        const res = await fetch(LIVE_API); if (!res.ok) return;
        const raw = await res.json(); if (raw.error) return;
        liveMode = true;
        document.getElementById('api-dot').className = 'api-dot live';
        document.getElementById('api-label').textContent = 'Live sensor + weather API';
      } catch (e) { }
    }
    fetchLive(); setInterval(fetchLive, 30000);
