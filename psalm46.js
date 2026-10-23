/* Psalm 46 uses the original four-tab devotional design. Scripture is supplied
   at runtime from the same complete BSB data used by the Bible reader. */
(function () {
  'use strict';
  const key = 'scripture-for-life.psalm46-progress';
  const sourceURL = 'https://biblehub.com/bsb/psalms/46.htm';
  let tab = 'meaning';
  let active = null;

  const sections = [
    {
      verses: [1], short: 'Refuge', title: 'A place of refuge', palette: 0,
      heading: 'Help within the trouble',
      explain: 'The song begins with a shared confession: God is “our” refuge and strength. Trouble is already part of the picture. The singers express confidence that God is present and available to help within it. A personal application might be to bring your fear honestly to God and seek the support you need, while remembering that the verse is first a song voiced by a community.',
      context: 'The heading names the sons of Korah and identifies this as a song for the choirmaster. It does not name David as its author or specify the event that prompted it. The BSB note describes Alamoth as probably a musical or liturgical term. The publisher’s source includes this heading in the verse 1 record, so it is preserved above.',
      explore: [
        ['Refuge and strength', 'These opening images describe both shelter and help to keep going. Read the repeated fortress language in verses 7 and 11 alongside this beginning.'],
        ['“Our” refuge', 'The plural language matters. This is a community’s song of trust, which individual readers can also reflect on.']
      ],
      reflect: 'What are you carrying today, and what would it look like to ask God and someone you trust for help?',
      prayer: 'God, meet me in what I am facing. Help me receive Your care and ask for the support I need. Amen.',
      related: ['Psalm 23:4', 'Isaiah 41:10']
    },
    {
      verses: [2, 3], short: 'Unshaken', title: 'When the ground feels uncertain', palette: 2,
      heading: 'Trust amid the upheaval',
      explain: 'The opening “therefore” connects this declaration of courage with the refuge described in verse 1. The images are dramatic: earth transformed, mountains falling, and waters roaring. The singers imagine even the foundations of their world giving way, then speak their trust in God. This poetic declaration makes room for acknowledging danger; it need not become a judgment against someone who feels afraid.',
      context: 'Verses 1–3 form the first movement of the psalm. The language of roaring returns in verse 6, where nations rage. Reading those pictures together helps us follow the movement from upheaval in nature to turmoil among peoples. Selah appears here and again after verses 7 and 11; its exact musical or liturgical function is uncertain.',
      explore: [
        ['Mountains and roaring waters', 'Images of stability collapsing and powerful waters in motion make the scale of the threat vivid. The poem does not identify a particular natural disaster.'],
        ['“Therefore”', 'The confidence of verse 2 rests on the description of God in verse 1. Keep those sentences together when considering their meaning.'],
        ['Selah', 'A term found within the song. Readers often use it as an invitation to pause, while acknowledging that its exact function is not settled.']
      ],
      reflect: 'What feels uncertain beneath your feet? Is there one source of support you could turn toward today?',
      prayer: 'Lord, help me face uncertainty honestly and remember Your presence when I feel afraid. Amen.',
      related: ['Psalm 56:3', 'Psalm 46:1']
    },
    {
      verses: [4, 5], short: 'Presence', title: 'A river and a place to belong', palette: 0,
      heading: 'The city is held by God’s presence',
      explain: 'The poem changes from roaring seas to a river that brings gladness. God’s dwelling is at the center of this city’s confidence. In “God is within her,” “her” refers to the city described in verse 4. Personal encouragement can grow from the theme of God’s presence, while respecting the original image of a worshiping community and its holy place.',
      context: 'These lines begin the psalm’s middle movement, verses 4–7. The city of God and the holy dwelling place evoke Jerusalem and its sanctuary. The text does not name a specific river, date the promised dawn, or describe the exact historical occasion. It is best to keep those details open rather than make the illustration into a geographical reconstruction.',
      explore: [
        ['The river', 'In this scene, water brings gladness instead of the threat pictured in verses 2–3. Notice what the change in imagery does within the song.'],
        ['“Her”', 'The pronoun points back to the city. Reading verse 5 with verse 4 keeps a popular quotation connected to its actual subject.'],
        ['Morning dawns', 'The verse anticipates help with the arrival of morning. It does not give readers a timetable for when a personal difficulty must end.']
      ],
      reflect: 'Where do you experience belonging, and how might you help someone else feel less alone?',
      prayer: 'God, help me recognize Your care and make room for others who need comfort and belonging. Amen.',
      related: ['Psalm 23:2', 'Revelation 22:1']
    },
    {
      verses: [6, 7], short: 'Fortress', title: 'A fortress amid the noise', palette: 1,
      heading: 'The refrain brings us back to presence',
      explain: 'The turmoil now involves nations and kingdoms. Against this noise, the poem describes the power of God’s voice, then returns to a shared assurance: the LORD is with us. The fortress image echoes the refuge of verse 1. For a reader facing alarming events, an application might be to pause with this refrain and consider a faithful, practical next step.',
      context: 'Verse 7 closes the middle movement. Its words return in verse 11, giving the song a repeated statement to hold onto. “The God of Jacob” connects this confidence with the biblical story of Jacob and his descendants. The psalm does not turn its language about nations into an endorsement of any present-day political group.',
      explore: [
        ['The LORD of Hosts', 'A title emphasizing God’s power. Here it is paired with the intimate assurance that He is with the singers.'],
        ['The God of Jacob', 'This name ties the song’s worship to the God known in Israel’s ancestral story. Genesis 28:13–15 offers one place to explore that connection.'],
        ['The repeated refrain', 'Compare verses 7 and 11. The same confession of presence and refuge holds the later parts of the song together.']
      ],
      reflect: 'What noise is taking most of your attention? What might help you return to what is steady and worthwhile?',
      prayer: 'Lord, steady my attention. Help me respond to the world with wisdom, courage, and care for others. Amen.',
      related: ['Genesis 28:15', 'Psalm 46:11']
    },
    {
      verses: [8, 9], short: 'Peace', title: 'When the weapons fall silent', palette: 3,
      heading: 'An invitation to look at God’s works',
      explain: 'The singers invite others to look at the LORD’s works. The language includes devastation, then the ending of warfare and the destruction of weapons. Both parts belong to the passage: divine power is portrayed as confronting conflict and bringing fighting to an end. An application might be to pray for people caught in war and seek ways to practice peace where you have responsibility.',
      context: 'Verses 8–11 form the final movement of the psalm. The broken bow, shattered spear, and burning shields are concrete images of warfare being brought to a halt. The BSB footnote gives “chariots” as an alternative to “shields” in verse 9. The passage does not authorize a reader to use violence against someone else.',
      explore: [
        ['“Come, see”', 'The words invite attention to what the song says God has done. This invitation prepares for the command and declaration in verse 10.'],
        ['Broken weapons', 'The listed weapons lose their ability to sustain fighting. Read the imagery alongside the statement that God makes wars cease.'],
        ['Shields or chariots', 'The BSB footnote records an alternative rendering in verse 9. Either way, the scene concerns the equipment of war.']
      ],
      reflect: 'Where could you take one practical step toward peace, reconciliation, or care for someone affected by conflict?',
      prayer: 'God, have mercy on those caught in conflict. Help me practice peace and protect the dignity of others. Amen.',
      related: ['Isaiah 2:4', 'Matthew 5:9']
    },
    {
      verses: [10, 11], short: 'Be still', title: 'Be still and know', palette: 0,
      heading: 'Stillness within a much larger declaration',
      explain: '“Be still” is followed by the declaration that God will be exalted among the nations and over the earth. It comes after scenes of upheaval and warfare. A common reading understands the command as a call to cease striving or hostility and acknowledge God’s rule. Quiet prayer is a possible personal response, while the whole verse keeps the meaning larger than a relaxation exercise. The song closes by repeating that the LORD is with His people.',
      context: 'Readers discuss whether verse 10 primarily addresses the warring nations, the worshiping community, or both. The shared setting is the turmoil and conflict described across the psalm. Verse 11 returns to the same refrain as verse 7. Reading the command with its next sentence and the closing refrain helps us avoid treating four familiar words as the whole message.',
      explore: [
        ['“Be still and know”', 'Read the command with the words that follow: “I will be exalted among the nations.” Its setting concerns acknowledging God amid the world’s upheaval.'],
        ['“I will be exalted”', 'The repeated statement extends the scene beyond one person or city to the nations and the earth.'],
        ['The closing fortress', 'The final words return to God’s presence and the image of refuge. Compare the beginning of the psalm and its two repeated refrains.']
      ],
      reflect: 'What would it mean to pause before responding today, acknowledge God, and choose a wise next step?',
      prayer: 'God, help me be attentive to You. Give me wisdom to act where I can and trust You with what I cannot control. Amen.',
      related: ['Psalm 46:1', 'Psalm 46:7', 'Philippians 4:6', 'Philippians 4:7']
    }
  ];

  function refs(n) { return sections[n - 1].verses.map(v => `Psalm 46:${v}`); }
  function link(ref) {
    const match = /^Psalm 46:(\d+)$/.exec(ref);
    if (!match) return '';
    const step = sections.findIndex(s => s.verses.includes(Number(match[1])));
    return step < 0 ? '' : `#/study/46/${step + 1}`;
  }
  function progress() {
    try { const n = Number(localStorage.getItem(key)); return n >= 1 && n <= 6 && Number.isInteger(n) ? n : 1; }
    catch { return 1; }
  }
  function remember(n) { try { localStorage.setItem(key, String(n)); } catch {} }
  const artDescriptions=['A welcoming stone refuge before distant storm clouds.','Roaring waves meet crumbling rocky mountains.','A peaceful river beside an imagined ancient city at dawn.','A steadfast stone fortress under a turbulent sky.','Broken, abandoned weapons amid fresh green growth.','Still water reflects the dawn near a distant refuge.'];
  function art(n) { return `<img class="ps46-watercolor" data-psalm46-art="${n}" src="assets/psalm46/section-${n}-watercolor.webp" width="1280" height="853" alt="${artDescriptions[n-1]}" decoding="async">`; }
  function homeCard(ctx) {
    return `<section class="ps46-card" aria-labelledby="ps46-home-title"><div class="ps46-card-art">${art(1,ctx)}</div><div><span class="eyebrow">Scripture, poetry & imagery</span><h2 id="ps46-home-title">Find refuge in Psalm 46.</h2><p>When life feels uncertain, explore the song of refuge, presence, and stillness. Read all eleven verses in their context.</p><a class="btn outline" href="#/study/46/1">Read Psalm 46 ${ctx.icon('arrow')}</a>${progress()>1?`<a class="text-link ps46-resume" href="#/study/46/${progress()}">Continue at section ${progress()} ↗</a>`:''}</div></section>`;
  }
  function panel(n, ctx) {
    const s = sections[n - 1], E = ctx.escapeHTML, ref = refs(n)[0];
    if (tab === 'context') return `<span class="label">Literary context & translation notes</span><h3>See the wider picture.</h3><p>${E(s.context)}</p><a class="text-link" href="#/read/19/46/${s.verses[0]}">Read the complete psalm ↗</a>`;
    if (tab === 'explore') return `<span class="label">Explore the imagery</span><h3>Look a little closer.</h3>${s.explore.map(([word,body],i)=>`<details class="word-detail" ${i===0?'open':''}><summary>${E(word)}</summary><p>${E(body)}</p></details>`).join('')}<p class="sources-inline">Read <a class="source-link" href="${sourceURL}" target="_blank" rel="noopener noreferrer">Psalm 46 and its BSB footnotes</a>. Illustrations are symbolic, not historical reconstructions.</p>`;
    if (tab === 'reflect') return `<span class="label">Personal application · everything here is optional</span><p class="reflection-q">${E(s.reflect)}</p><details class="word-detail"><summary>A suggested prayer</summary><p>${E(s.prayer)}</p><span class="small">Original reflection aid · not Scripture</span></details>${ctx.noteField(ref)}<button class="btn outline" style="margin-top:12px" data-action="save-note" data-ref="${ref}">Save reflection ${ctx.icon('bookmark')}</button><p class="small">This section’s reflection is saved with ${ref}.</p>`;
    return `<span class="label">An explanation · separate from Scripture</span><h3>${E(s.heading)}</h3><p>${E(s.explain)}</p><span class="label" style="margin-top:22px">Read alongside</span><div class="related-links">${s.related.map(r=>`<a class="ref-chip" href="${ctx.refURL(r)}">${E(r)} ↗</a>`).join('')}</div>`;
  }
  function render(n, ctx) {
    n = Number(n);
    if (!Number.isInteger(n) || n < 1 || n > sections.length) throw new Error('That Psalm 46 section could not be found.');
    const s = sections[n - 1], E = ctx.escapeHTML;
    if (s.verses.some(v => typeof ctx.chapter[v] !== 'string')) throw new Error('Psalm 46 text could not be loaded. Please try again.');
    remember(n); active = {n, ctx};
    const range = `Psalm 46:${s.verses[0]}${s.verses.length>1?'–'+s.verses.at(-1):''}`;
    return `<div class="container ps46-page">${window.SFL_PSALMS.switcher(46)}<header class="study-top"><div><span class="eyebrow">Psalm 46 · Poetry & imagery</span><h1>God is our refuge and strength.</h1><p>Read the poem with illustrations of refuge, upheaval, God’s presence, and stillness.</p><button class="btn outline" data-action="listen-psalm46">${ctx.icon('volume')} Listen to all of Psalm 46</button></div><div class="study-landscape psalm46-landscape">${art(n,ctx)}<span class="scene-label">SYMBOLIC ILLUSTRATION · NOT A HISTORICAL LOCATION</span></div></header><div class="verse-study-navigation"><div class="psalm-verse-select"><label for="psalm-verse-select">Go to verse</label><select id="psalm-verse-select" data-psalm-verse-select data-psalm="46" aria-label="Go to a verse in Psalm 46">${sections.map((x,i)=>`<option value="${i+1}" ${n===i+1?'selected':''}>${x.verses.length>1?'Verses '+x.verses[0]+'–'+x.verses.at(-1):'Verse '+x.verses[0]} of 11 · ${E(x.short)}</option>`).join('')}</select></div></div><div class="study-body"><section class="study-verse"><span class="eyebrow">${range} · BSB</span><h2>${E(s.title)}</h2>${s.verses.map(v=>{const ref=`Psalm 46:${v}`;return `<div class="ps46-passage"><div class="verse-heading"><span class="verse-ref">${ref}</span>${ctx.saveButton(ref,true)}</div><p class="verse-text" data-speakref="${ref}">${E(ctx.chapter[v])}</p><div class="verse-actions"><button class="icon-btn" data-action="listen-verse" data-ref="${ref}">${ctx.icon('volume')} Listen</button><button class="icon-btn" data-action="copy-verse" data-ref="${ref}">${ctx.icon('copy')} Copy verse</button></div></div>`;}).join('')}${s.verses.length>1?`<button class="btn outline" data-action="listen-psalm46-section" data-section="${n}">${ctx.icon('volume')} Listen to both verses</button>`:''}<div class="study-bottom">${n>1?`<a class="btn outline" href="#/study/46/${n-1}">${ctx.icon('back')} Previous</a>`:'<a class="text-link" href="#/read/19/46">Read full chapter</a>'}<span>${n} of 6</span>${n<6?`<a class="btn" href="#/study/46/${n+1}">Next ${ctx.icon('arrow')}</a>`:`<a class="btn" href="#/saved">My reflections ${ctx.icon('bookmark')}</a>`}</div>${n===6?'<p class="small ps46-complete">You have reached the end of Psalm 46. Return whenever you need these words. <a class="source-link" href="#/study/46/1">Begin again.</a></p>':''}</section><section class="study-explainer" aria-label="Understand this passage"><div class="tabs" role="tablist" aria-label="Study tools">${[['meaning','Meaning'],['context','Context'],['explore','Explore'],['reflect','Reflect']].map(([id,label])=>`<button class="tab" role="tab" id="tab-${id}" aria-selected="${tab===id}" aria-controls="study-panel" tabindex="${tab===id?0:-1}" data-action="study46-tab" data-tab="${id}">${label}</button>`).join('')}</div><div id="study-panel" class="tab-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-${tab}">${panel(n,ctx)}</div></section></div><section class="ps46-people" aria-labelledby="ps46-people-heading"><span class="eyebrow">People, stories, and encouragement</span><h2 id="ps46-people-heading">Meet the people connected with this psalm.</h2><p>Follow the song’s heading and its words “the God of Jacob” into the biblical accounts. Bring what you learn back to your own questions about fear, strength, and belonging.</p><div class="people-grid"><a class="person-card" href="#/people/sons-of-korah"><span class="person-symbol">${ctx.icon('people')}</span><h3>Sons of Korah</h3><p>A family connected with worship and this song of refuge.</p><span class="more">Explore their biblical story ↗</span></a><a class="person-card" href="#/people/jacob"><span class="person-symbol">${ctx.icon('compass')}</span><h3>Jacob</h3><p>Fear, family, prayer, and the name echoed in the refrain.</p><span class="more">Explore Jacob’s story ↗</span></a></div><div class="ps46-help-links"><a class="text-link" href="#/help/fear">Find Scripture for fear & worry ↗</a><a class="text-link" href="#/help/strength">Find comfort & strength ↗</a></div></section><section class="study-context"><div><h3>A song from the sons of Korah.</h3><p>The psalm’s heading names the sons of Korah. Read about Korahite singers in 2 Chronicles 20:19, while keeping that account distinct from the unknown occasion of this particular psalm.</p><a class="text-link" href="${ctx.refURL('2 Chronicles 20:19')}">Explore the biblical connection ↗</a><p><a class="text-link" href="#/study/23/1">Return to Psalm 23 ↗</a></p></div><div><h3>Grounded in the passage.</h3><p>All eleven verses are quoted from the app’s complete public-domain BSB. Notes, questions, prayers, and illustrations are editorial additions, separate from Scripture.</p><a class="source-link small" href="${sourceURL}" target="_blank" rel="noopener noreferrer">View Psalm 46 and its BSB footnotes ↗</a></div></section>${window.SFL_PSALMS.nextStudy(46)}</div>`;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action="study46-tab"]');
    if (!button || !active || !/^#\/study\/46\//.test(location.hash)) return;
    event.preventDefault();
    tab = button.dataset.tab;
    const parent = button.closest('.study-explainer');
    parent.querySelectorAll('[role="tab"]').forEach(el => {
      el.setAttribute('aria-selected', String(el.dataset.tab === tab));
      el.tabIndex = el.dataset.tab === tab ? 0 : -1;
    });
    const panelElement = parent.querySelector('#study-panel');
    panelElement.innerHTML = panel(active.n, active.ctx);
    panelElement.setAttribute('aria-labelledby', `tab-${tab}`);
    active.ctx.hydrateNotes();
  });
  window.SFL_PSALM46 = {sections, refs, link, progress, render, homeCard};
})();
