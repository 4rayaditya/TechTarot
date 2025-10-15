// (function () {
//     const startBtn = document.getElementById('startInterview');
//     const skipBtn = document.getElementById('skipInterview');
//     const status = document.getElementById('interviewStatus');
//     const gemInput = document.getElementById('gemKey');
//     const q_gpa = document.getElementById('q_gpa');
//     const q_hobbies = document.getElementById('q_hobbies');
//     const q_bio = document.getElementById('q_bio');

//     function saveInterview(obj) {
//         try { localStorage.setItem('tt-orb-interview', JSON.stringify(obj)); } catch (e) { }
//     }

//     async function callGemini(prompt, apiKey) {
//         // Basic fetch to Gemini-compatible endpoint (user-provided key). This is only executed in-browser.
//         // The exact Gemini REST API details and endpoint can change; we use a minimal approach that posts to
//         // https://api.google.com/gemini/ (user will supply key). If it fails, fall back to local clientMock.
//         try {
//             const res = await fetch('https://gemini.googleapis.com/v1/engines/text-bison:generate', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${apiKey}`
//                 },
//                 body: JSON.stringify({
//                     prompt: prompt,
//                     max_output_tokens: 350
//                 })
//             });
//             if (!res.ok) throw new Error('Gemini request failed: ' + res.status);
//             const j = await res.json();
//             // try to extract text from common fields
//             const text = j?.candidates?.[0]?.content || j?.outputs?.[0]?.text || JSON.stringify(j);
//             return String(text);
//         } catch (err) {
//             console.warn('Gemini call failed, falling back to clientMock', err);
//             return null;
//         }
//     }

//     async function synthesize(interview, apiKey) {
//         const prompt = `You are an assistant. Summarize the following person for a short personality report.\n\nBio: ${interview.bio}\nGPA: ${interview.gpa}\nHobbies: ${interview.hobbies}\n\nRespond with a short paragraph describing likely strengths, working style, and 3 suggested future roles.`;
//         if (apiKey) {
//             const out = await callGemini(prompt, apiKey);
//             if (out) return out;
//         }
//         // fallback to local simple mock (reuse clientMock if available)
//         if (window.clientMock) {
//             const res = await window.clientMock('Person summary', prompt, { mode: 'coach', deep: true });
//             return res.reading || res;
//         }
//         // ultimate fallback
//         return `Bio: ${interview.bio}\nGPA: ${interview.gpa}\nHobbies: ${interview.hobbies}`;
//     }

//     startBtn?.addEventListener('click', async () => {
//         status.textContent = 'Running interview…';
//         startBtn.disabled = true; skipBtn.disabled = true;
//         const interview = { gpa: (q_gpa?.value || '').trim(), hobbies: (q_hobbies?.value || '').trim(), bio: (q_bio?.value || '').trim(), timestamp: Date.now() };
//         const apiKey = (gemInput?.value || '').trim();
//         try {
//             const summary = await synthesize(interview, apiKey || null);
//             interview.summary = String(summary);
//             saveInterview(interview);
//             status.innerHTML = '<div style="color:var(--accent-2)">Interview complete. <button id="continueMain" class="btn primary" style="margin-left:10px">Continue</button></div>';
//             document.getElementById('continueMain').addEventListener('click', () => { window.location.href = '/'; });
//         } catch (err) {
//             status.textContent = 'Interview failed: ' + err.message;
//             startBtn.disabled = false; skipBtn.disabled = false;
//         }
//     });

//     skipBtn?.addEventListener('click', () => {
//         // clear saved interview and go to main
//         try { localStorage.removeItem('tt-orb-interview'); } catch (e) { }
//         window.location.href = '/';
//     });
// })();
