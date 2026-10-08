export const WELCOME = "Good morning, everybody! Please find your seat. We are about to start church service. Welcome to Jace and Halli's World Church of Christ. We want to remind you to pay attention to the lesson and remain seated during service. Sit beside Mommy, keep your feet off the seats, and use a quiet voice. When you are ready, press Start Church.";
export const OPENING_PRAYER = "Dear God, thank you for loving us. Thank you for Jesus and our family. Help us listen, learn, and be kind. In Jesus' name, Amen.";
export const CLOSING_PRAYER = "Dear God, thank you for our Bible lesson. Help us share, use gentle hands, and love others. Keep our family safe. In Jesus' name, Amen.";
export const PRAYER_PROMPT = 'Prayer is talking to God. Jace and Halli, bow your heads, close your eyes, and fold your hands. You can pray along with me.';
export const DISMISSAL = 'Church is over. Thank you for learning, singing, and praying with us! Walk with Mommy. Now we can say hello to our church friends.';
export const AUDIO = {
 welcome:'https://resource2.heygen.ai/text_to_speech/783155dd0848415e80d42750c61f95e3/02f211a5ef524caea2ad8447e72b218c/id=39d86d90-d6ac-4804-b4b0-7c03d96312a0.wav',
 prayers:'https://resource2.heygen.ai/text_to_speech/783155dd0848415e80d42750c61f95e3/02f211a5ef524caea2ad8447e72b218c/id=3b7a7303-fca5-4f70-ab28-71f9df19ad25.wav'
};
// YouTube videos are played by the official embedded player; never downloaded/rehosted.
// The Noah item is a complete 1:48 story, bounded inside the publisher's Jr compilation.
export const LESSONS = [
 {id:'creation',title:'God Made Our World',short:'Creation',reference:'Genesis 1–2',video:{id:'teu7BCZTgDs',start:0,end:209,label:'Creation · Saddleback Kids',seconds:209},intro:'Today we are learning about creation. Creation means everything God made. Look for the sky, the animals, and the people!',story:[
 ['In the beginning','The Bible tells us that God made our world. God said, Let there be light! There was day and there was night. Can you say, light?'],
 ['A beautiful world','God made the sky and the sea. God made dry land, green plants, and trees. God made the sun, moon, and stars. Point up to the sky!'],
 ['So many animals','God made fish in the water, birds in the sky, and animals on the land. Think of your favorite animal. God made people, too. God made Adam and Eve.'],
 ['Thank you, God','God saw that what he had made was very good. After six days of creating, God rested on the seventh day. We can thank God and help care for his world.']],quiz:[
 {q:'Who made the world?',choices:['God','A monster truck','A teddy bear'],answer:0,reply:'A! God made the world. Thank you, God!'},
 {q:'Which animal can swim in the sea?',choices:['A shoe','A fish','A cookie'],answer:1,reply:'B! A fish can swim in the sea. God made the fish!'},
 {q:'What can we say to God for our beautiful world?',choices:['Beep, beep!','Where is my sock?','Thank you, God!'],answer:2,reply:'C! Thank you, God! You remembered!'}]},
 {id:'adam-eve',title:'Adam & Eve',short:'Adam & Eve',reference:'Genesis 2–3',video:{id:'VG3D9EOwSyc',start:0,end:271,label:'Adam and Eve · Saddleback Kids',seconds:271},intro:'God made Adam and Eve. They lived in a beautiful garden. Let us listen and learn why listening to God matters.',story:[
 ['A special garden','God made the first people, Adam and Eve. They lived in a beautiful garden called Eden. There were plants, trees, and animals. God gave them work to care for the garden.'],
 ['God gave a rule','God told them not to eat the fruit from one special tree. Listening to God was important. A snake tempted Eve to break that rule.'],
 ['A wrong choice','Adam and Eve ate the fruit God had told them not to eat. They hid, but God knew what happened. Their choice had consequences, and they had to leave the garden. God still cared for them.'],
 ['We can learn','We can listen, tell the truth, and ask for help when we make a mistake. In church, we can practice listening beside Mommy. God loves us as we learn.']],quiz:[
 {q:'Who were the first people God made?',choices:['Jace and a dinosaur','Adam and Eve','Two teddy bears'],answer:1,reply:'B! Adam and Eve were the first people God made.'},
 {q:'Where did Adam and Eve live?',choices:['In a garden','In a race car','In a lunchbox'],answer:0,reply:'A! They lived in a beautiful garden called Eden.'},
 {q:'What is a good choice?',choices:['Hide the truth','Stand on the church seats','Listen and tell the truth'],answer:2,reply:'C! Listen and tell the truth. We can practice together!'}]},
 {id:'noah',title:'Noah’s Ark',short:'Noah’s Ark',reference:'Genesis 6–9',video:{id:'j1QfF1JKHVo',start:778,end:886,label:'Noah · Stories of the Bible Jr. · Saddleback Kids',seconds:108},intro:'Noah listened to God and built a very big boat called an ark. Watch for Noah, his family, and the animals!',story:[
 ['A big boat','God told Noah to build an ark. An ark is a very big boat. Noah listened and did what God said. Pretend to tap a little hammer with one finger.'],
 ['All aboard','Noah, his family, and the animals went inside the ark. God kept them safe inside. Can you name an animal that went on the ark?'],
 ['Rain, rain','Rain fell and water covered the land. The ark floated. After a long time, the rain stopped and the water went down. Noah sent out birds to look for dry land.'],
 ['God’s promise','At last, Noah, his family, and the animals came out. Noah thanked God. God put a rainbow in the sky as a sign of his promise. We can listen to God and say thank you.']],quiz:[
 {q:'Who built the ark?',choices:['Halli','A puppy','Noah'],answer:2,reply:'C! Noah built the ark. Great listening!'},
 {q:'What is an ark?',choices:['A big boat','A little cookie','A pair of shoes'],answer:0,reply:'A! An ark is a big boat.'},
 {q:'What did God put in the sky as a sign of his promise?',choices:['A toy truck','A rainbow','A sandwich'],answer:1,reply:'B! A rainbow. God keeps his promises!'}]},
 {id:'jonah',title:'Jonah & the Big Fish',short:'Jonah & the Whale',reference:'Jonah 1–3',video:{id:'WOSadLyqshg',start:0,end:179,label:'Jonah and the Fish · Saddleback Kids',seconds:179},intro:'You may call this Jonah and the whale. The Bible calls it a great fish. Jonah learned that God hears our prayers, wherever we are.',story:[
 ['Jonah went the other way','God told Jonah to go to a city called Nineveh. Jonah did not want to go. He got on a boat going the other way.'],
 ['A storm at sea','A big storm came. Jonah told the sailors about his choice. Jonah went into the sea, and God sent a great fish to swallow him. God kept Jonah alive inside the fish.'],
 ['Jonah prayed','Jonah was inside the fish for three days and three nights. Jonah prayed to God. Prayer is talking to God. God heard Jonah, even inside a fish!'],
 ['A second chance','The fish put Jonah back on dry land. God told Jonah to go to Nineveh again. This time Jonah listened. God gave him another chance. We can pray, listen, and try again, too.']],quiz:[
 {q:'Who was swallowed by the big fish?',choices:['Christopher','Jonah','Jace'],answer:1,reply:'B! Jonah was swallowed by the big fish!'},
 {q:'Who did Jonah pray to inside the fish?',choices:['A toy truck','A banana','God'],answer:2,reply:'C! Jonah prayed to God. God hears our prayers.'},
 {q:'What did Jonah do when God gave him another chance?',choices:['He listened to God','He ate a shoe','He turned into a bubble'],answer:0,reply:'A! Jonah listened to God. We can listen, too!'}]},
 {id:'jesus',title:'Who Is Jesus?',short:'Who Is Jesus?',reference:'Luke 2; Mark 10:13–16; John 3:16; Luke 24',video:{id:'VPUMDVBO7dY',start:0,end:86,label:'Jesus and the Children · Saddleback Kids',seconds:86},intro:'Jesus is God’s Son. He was born as a baby and grew up. Jesus taught people about God, helped people who were sick, and showed us how to love. He died and rose again. Jesus is alive, and he loves you! Watch how Jesus welcomes children.',story:[
 ['God’s Son','Jesus is God’s Son. He was born as a baby. Mary cared for him, and Joseph helped take care of him. Jesus grew up, just like children grow.'],
 ['Jesus helps people','Jesus taught people about God. He was kind, helped people who were sick, and showed people how to love and forgive. We can follow Jesus by being kind and helping.'],
 ['Come to Jesus','Some people brought children to Jesus. His friends tried to stop them, but Jesus welcomed the children. He loved them! Jesus loves Jace and Halli, too.'],
 ['Jesus is alive','Jesus died, and on the third day he rose again. Jesus is alive! We can learn about Jesus in the Bible. We can thank God for Jesus, love others, and pray every day.']],quiz:[
 {q:'Who is Jesus?',choices:['God’s Son','A toy dinosaur','A race car'],answer:0,reply:'A! Jesus is God’s Son. He loves you!'},
 {q:'Did Jesus welcome the children?',choices:['No, only teddy bears','No, only trucks','Yes! Jesus loves children'],answer:2,reply:'C! Yes! Jesus welcomed the children. He loves Jace and Halli, too!'},
 {q:'How can we follow Jesus?',choices:['Push others','Be kind and help others','Walk on the church seats'],answer:1,reply:'B! Be kind and help others. You can show love!'}]}
];
export const SONGS={
 opening:{id:'LxgUtFZlQ70',start:22,end:40,seconds:18,title:'Yes, Jesus Loves Me',label:'Jesus loves me · Acapella Bible Songs for kids',lyrics:['Yes, Jesus loves me.','Yes, Jesus loves me.','Yes, Jesus loves me.','The Bible tells me so.']},
 closing:{id:'rRy6WGIX8cE',start:11,end:40,seconds:29,title:'This Little Light of Mine',label:'This Little Light Of Mine · Sing Along Acapella',lyrics:['This little light of mine, I’m gonna let it shine.','This little light of mine, I’m gonna let it shine.','This little light of mine, I’m gonna let it shine.','Let it shine, let it shine, let it shine.']}
};
export const SERVICE_STEPS=['Welcome','Sing','Pray','Bible lesson','Three questions','Sing','Pray','Goodbye'];
export function nextLesson(saved={},random=Math.random){
 const ids=LESSONS.map(l=>l.id);let bag=Array.isArray(saved.bag)?[...new Set(saved.bag)].filter(id=>ids.includes(id)):[];
 if(!bag.length){bag=[...ids];for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag[0]===saved.last)[bag[0],bag[1]]=[bag[1],bag[0]];}
 const id=bag.shift();return {lesson:LESSONS.find(l=>l.id===id),state:{bag,last:id}};
}
