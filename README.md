SchachZWO-Online
================

"[SchachZWO](http://www.schachzwo.de/)" ist eine moderne Variante des klassischen Schachs, welche von einem [dresdner Spiele-Autor](http://www.schachzwo.de/impressum/) als Brett-Spiel entwickelt wird. 

**SchachZWO-Online** ist die Umsetzung des Brettspiels als Online-Browser-Spiel, bei dem zwei Spieler über das Internet miteinander SchachZWO spielen können.

Das Projekt ist im Rahmen der Lehrveranstaltung "XML-basierte Anwendungen" des Master-Studiengangs [Informatik an der Hochschule Zittau/Görlitz](http://www.hszg.de/f-ei) im Sommersemester 2014
entstanden. 
Beteiligt waren [Marlene Knoche](https://github.com/Sanguinik), [Manuel Mauky](https://github.com/lestard), [Erik Jähne](https://github.com/s3erjaeh) und [Paul Weinhold](https://github.com/weinpau), 
sowie [Prof. Dr. Christian Wagenknecht](https://www.hszg.de/f-ei/fakultaet/professoren/christian-wagenknecht).

## Technisches

SchachZWO-Online ist durchgängig in JavaScript programmiert.
Auf Serverseite wurden [Node.js](http://nodejs.org/) sowie [Express](http://expressjs.com/) eingesetzt. 
Als Datenbank-Backend kann zwischen [MongoDB](http://www.mongodb.org/) und [CouchDB](https://couchdb.apache.org/) gewählt werden.

Im Client kommen 
[Angular.js](https://angularjs.org/), 
[JQuery](https://jquery.com/), 
[Bootstrap](http://getbootstrap.com/),
[RequireJS](http://requirejs.org/) 
sowie HTML5-Canvas zum Einsatz.

Die Kommunikation zwischen Server und Client baut auf einer Kombination aus [Server-Sent Events (SSE)](https://en.wikipedia.org/wiki/Server-sent_events) und einer REST-artigen Webservice-Schnittstelle auf.
