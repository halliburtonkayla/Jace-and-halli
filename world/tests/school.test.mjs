import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {LETTERS,NUMBERS,BOOKS,numberQuiz,gradeFor} from '../client/school/data.mjs';
import {SCHOOL_MEDIA} from '../client/school/media.mjs';
test('number quizzes keep three distinct choices, cover all digits and exceed 100 combinations',()=>{
 const combinations=new Set(),targets=new Set();
 for(let i=0;i<500;i++){const questions=numberQuiz();assert.equal(questions.length,5);assert.equal(new Set(questions.map(q=>q.correct)).size,5);
 for(const q of questions){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert(q.options.includes(q.correct));q.options.forEach(id=>assert(NUMBERS.some(n=>n.id===id)));targets.add(q.correct);combinations.add(q.correct+':'+[...q.options].sort().join(','));}}
 assert.equal(targets.size,10);assert(combinations.size>=100);
});
test('alphabet includes all 26 letters and requested family associations; books have 5–10 pages',()=>{
 assert.equal(LETTERS.map(l=>l.id).join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');for(const [id,word]of Object.entries({A:'Apple',B:'Banana',H:'Halli',J:'Jace',K:'Keke',U:'Unique'}))assert.equal(LETTERS.find(l=>l.id===id).word,word);
 for(const [child,books]of Object.entries(BOOKS)){assert(books.length>=5,child);for(const b of books)assert(b.pages.length>=5&&b.pages.length<=10,b.title);}
 assert.equal(gradeFor(3,3),'A');assert.equal(gradeFor(0,3),'F');
});
test('five finished local videos exist and fit the requested durations',()=>{
 assert.equal(Object.keys(SCHOOL_MEDIA).length,5);for(const clip of Object.values(SCHOOL_MEDIA)){assert(existsSync(fileURLToPath(clip.src)));assert(clip.duration<=30);}

});
