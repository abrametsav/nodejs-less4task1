'use strict';

const port = 5000;

const request = require( 'request' );
const cheerio = require('cheerio');

const express = require('express');
const app = express();
const templating = require( 'consolidate' );
const bodyParser = require( 'body-parser' );

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine( 'hbs', templating.handlebars);
app.set( 'view engine', 'hbs');
app.set( 'views', __dirname + "/views");

app.get( '/', (req, res) => {
  res.render( 'index', {
    partials: {
      header: 'header',
      form: 'form',
      footer: 'footer'
    }
  });
});

app.post( '/results', (req, res) => {
  let addr = 'http://ria.ru';
  let newsCategory = '';
  switch ( req.body.rianews ) {
    case 'economy':
      addr = addr + '/economy/';
      newsCategory = 'экономики';
      break;
    case 'politics':
      addr = addr + '/politics/';
      newsCategory = 'политики';
      break;
    case 'sport':
      addr = addr + '/sport/';
      newsCategory = 'спорта';
      break;
  };
  
  request( addr, ( error, response, body ) => {
    if( error ) {
      console.log( error );
      return;
    };
    if( response.statusCode !== 200 ) {
      console.log( 'Ошибка! Сервер вернул статус "' + response.statusCode + '"');
      return;
    };
    
    let news = [];
    const $ = cheerio.load( body );
    $( '.list_item_text' ).each( function( i, elem ) {
      news.push({
        newsTitle: $( this ).find( '.list_item_title' ).text(),
        newsAnnounce: $( this ).find( '.list_item_announce' ).text(),
        newsDate: $( this ).find( '.list_item_date' ).text(),
        newsLink: 'http://ria.ru' + $( this ).find( '.list_item_title a' ).attr("href")
      });
      return i<5; // не больше 5 новостей
    }); // $
    //console.log( news[0] );
    
    res.render( 'results', {
      newsCategory: newsCategory,
      news: news,
      partials: {
        header: 'header',
        form: 'form',
        footer: 'footer'
      }
    }); // res.render

  }); // request
}); // app.post

app.listen( port );