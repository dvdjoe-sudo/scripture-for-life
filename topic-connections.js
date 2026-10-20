/* Shared editorial connections for everyday needs, Scripture, people, and stories. */
(function(){
'use strict';
const connections={
  "fear": {
    "stories": [
      [
        "#/stories/8/7",
        "Esau Is Coming"
      ],
      [
        "#/exodus/3/6",
        "The sea ahead, the army behind"
      ]
    ],
    "people": [
      "jacob",
      "moses"
    ]
  },
  "strength": {
    "stories": [
      [
        "#/stories/10/2",
        "Accused and Imprisoned"
      ],
      [
        "#/exodus/2/3",
        "A promise heard through broken spirits"
      ]
    ],
    "people": [
      "sons-of-korah",
      "moses"
    ]
  },
  "health": {
    "stories": [
      [
        "#/exodus/3/11",
        "Bitter water and springs"
      ]
    ],
    "people": [
      "jesus"
    ]
  },
  "grief": {
    "stories": [
      [
        "#/stories/7/1",
        "A Field for Sarah"
      ]
    ],
    "people": [
      "jesus"
    ]
  },
  "direction": {
    "stories": [
      [
        "#/stories/5/1",
        "Leave Your Country"
      ],
      [
        "#/exodus/1/6",
        "The bush and the calling"
      ]
    ],
    "people": [
      "moses"
    ]
  },
  "alone": {
    "stories": [
      [
        "#/stories/5/6",
        "Hagar in the Wilderness"
      ],
      [
        "#/exodus/1/5",
        "Midian, a household, and a cry"
      ]
    ],
    "people": [
      "ruth"
    ]
  },
  "forgiveness": {
    "stories": [
      [
        "#/stories/12/8",
        "What You Intended for Evil"
      ]
    ],
    "people": [
      "peter"
    ]
  },
  "gratitude": {
    "stories": [
      [
        "#/stories/3/7",
        "The Rainbow Covenant"
      ],
      [
        "#/exodus/3/10",
        "A song on the far shore"
      ]
    ],
    "people": [
      "david",
      "miriam"
    ]
  }
};
const E=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chip=(href,label)=>`<a class="ref-chip" href="${E(href)}">${E(label)} ↗</a>`;
function topic(id,studyLink){
 const t=window.BIBLE_DATA.topics.find(t=>t.id===id),c=connections[id];if(!t||!c)return '';
 const psalms=t.refs.filter(r=>r.startsWith('Psalm '));
 return `<section data-topic-connections="${id}"><h3>Psalms to explore.</h3><div class="related-links">${psalms.map(ref=>chip(studyLink(ref),ref)).join('')}</div><h3>Stories to read alongside.</h3><div class="related-links">${c.stories.map(([route,title])=>chip(route,title)).join('')}</div><h3>People to meet.</h3><div class="related-links">${c.people.map(id=>window.PEOPLE.find(p=>p.id===id)).filter(Boolean).map(p=>chip('#/people/'+p.id,p.name)).join('')}</div><p class="small">These are thematic connections. Read each passage and story in its own setting.</p><a class="text-link" href="#/saved">Return to your saved verses and reflections ↗</a></section>`;
}
function related({ref,route,personId}={}){
 const topics=window.BIBLE_DATA.topics.filter(t=>t.refs.includes(ref)||connections[t.id]?.stories.some(([r])=>r===route)||connections[t.id]?.people.includes(personId));
 return `<section class="gen-scripture" data-related-needs><span class="eyebrow">Scripture for everyday life</span><h3>What are you facing today?</h3><div class="related-links">${topics.map(t=>chip('#/help/'+t.id,t.title)).join('')}</div><p><a class="text-link" href="#/">Explore all needs ↗</a><span aria-hidden="true"> · </span><a class="text-link" href="#/saved">Your saved verses and reflections ↗</a></p></section>`;
}
window.SFL_CONNECTIONS={connections,topic,related};
})();
