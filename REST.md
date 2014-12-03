
# REST API Dokumentation

----------
 
## Allgemeines

### Zugriff


Der Zugriff auf das REST API erfolgt über folgende URL:

	http://schachzwo.inf.hszg.de

Alle nachfolgenden Pfadenangaben dieser Dokumentation sind relativ zu dieser URL.

### Authentifzierung

Für viele Interaktionen mit dem Service ist eine Authentifzierung notwendig. Sie dient vor allem der Zugriffskontrolle für das Spielfeld, sodass nicht der Gegner ein Zug ausführt, obwohl er nicht an der Reihe ist oder ein Dritter einen Zug ausführen kann. Das Spiel kann auch ohne Authentifzierung verfolgt werden, als  neutraler Zuschauer.

Da die Kommunikation zustandslos ist, muss als aktiver Spieler bei jedem Request eine Authentifzierung erfolgen. Diese erfolgt mit der `Player-Id`, welche beim Login bekannt wird. Dabei gibt es zwei Möglichkeiten:

**Cookie**

Die Übertragung der `Player-Id` via Cookie ist der einfachste Weg der Authentifzierung für Webanwendung, denn der Cookie wird automatisch beim Login gesetzt.

Wenn man dies manuell konfigurieren möchte setzt man das Cookie `player_id` mit der jeweiligen Id.


**Authorization Header**

Eine zweite Möglichkeit die `Player-Id` beim Request zu übertragen ist der HTTP Authorization Header. Beispiel Header-Eintrag:

	Authorization: PLAYER_ID e1tWYLbBOg

### Datentypen

Die Kommunikation erfolgt mittels JSON. Hier noch einige Hinweise zu bestimmten Datentypen:

**Positionen**

Positionsangaben auf dem Spielfeld erfolgen durch die Angabe der Zeile (`row`) und Spalte (`column`). Die Nummerierungen der Zeilen und Spalten beginnen jeweils bei 0 in der linken oberen Ecke des Spielfelds aus Sicht des schwarzen Spielers.

**Spielfarbe**

Unterscheidung erfolgt mittels Zeichenkette:
	
- `"black"`
- `"white"`

**Spielfiguren**

Unterscheidung erfolgt mittels Zeichenkette:

- `"rocks"`
- `"man"`
- `"woman"`
- `"knight"`
- `"knowledge"`
- `"faith"`
- `"zenith"`

### Server-Sent Events

Folgende Zeichenketten sind für das Event `message` möglich:

- `update` (Spielzustand hat sich geändert; ein Zug wurde ausgeführt)
- `match-started` (Spiel beginnt)
- `draw-offered` (Mir wurde ein Remis angeboten)
- `draw-accepted` (Der Gegner hat meine Remisanfrage angenommen)
- `draw-rejected` (Der Gegner hat meine Remisanfrage abgelehnt)
- `won-check-target` (Gewonnen durch Zenit ins Mittfeld stellen)
- `won-check-target-and-opponent-follow-up` (Gewonnen durch Zenit ins Mittfeld stellen aber Gegner kann folgen)
- `won-check-mate` (Gewonnen durch Schachmatt)
- `won-given-up` (Gewonnen durch Aufgeben des Gegners)
- `lost-check-target` (Verloren da gegnerischer Zenit ins Mittfeld gestellt wurde)
- `lost-check-mate` (Verloren durch Schachmatt)
- `lost-given-up` (Verloren durch Aufgeben)
- `lost-can-follow-up` (Verloren, du kannst aber dem Gegner ins Mittelfeld folgen)
- `check` (Schachstellung)
- `stale-mate` (Patt)

## Ressourcen

Die Hauptressource und zugleich Einstiegspunkt des Webservices ist die Spielpartien-Ressource (`matches`). Alle untergeordneten Ressourcen sind wie folgt strukturiert:

- `/matches`
	- **POST** (neue Partie anlegen)
	- `/:matchId`
		- **GET** (Partie abrufen)
		- `/board`
			- **GET** (aktuelles Spielfeld abrufen)
		- `/captured-pieces`
			- **GET** (geschlagende Spielfiguren abrufen)
		- `/draw`
			- **PUT** (Remis)
		- `/event-stream`
			- **GET** (am SSE anmelden)
		- `/login`
			- **POST** (an der Partie anmelden)
		- `/moves`
			- **GET** (alle gespielten Züge abrufen)
			- **POST** (neuen Spielzug ausführen)
		- `/opponent`
			- **GET** (gegnerischen Spieler abrufen)
		- `/self`
			- **GET** (eigenen Spieler abrufen)
		- `/threats`
			- **GET** (alle Bedrohungen abrufen)
		- `/valid-moves`
			- **GET** (alle gültigen Spielzüge abrufen)

Nachfolgend werden alle einzelnen Ressourcen in Reihenfolge des Workflows erläutert.

### Neue Partie anlegen ###

Zunächst müssen wir eine Partie anlegen. Dazu führen wir ein HTTP-POST auf `\matches' aus. Bei SchachZwo kann man entweder eine 7x7 oder eine 9x9 Variante spielen. Somit übergeben wir ein JSON-Objekt, welches ein Feld mit der Spielfeldgröße beeinhaltet.   

	POST /matches

**Beispiel Request (7x7 Partie)**

	{
		size: 7
	}

**Beispiel Request (9x9 Partie)**

	{
		size: 9
	}

**Beispiel Response**

	Status: 201 Created
	Location: /lJyMJEZB_x 

	{
		"matchId": "lJyMJEZB_x"
		"state": "preparing"
		"size": 7
	}

Die Antwort enthält die `matchId` die jetzt bei allen Subresourcen angegeben werden muss.

**Mögliche Fehler**

- `400` - Fehlerhafter Request

### Partie abrufen ###

Wir können die angelegte Partie auch abrufen:

	GET /matches/:matchId

**Beispiel Response**

	Status: 200 OK

	{
		"matchId": "lJyMJEZB_x"
		"state": "preparing"
		"size": 7
	}

**Mögliche Fehler**

- `404` - Partie nicht gefunden
		
### An der Partie anmelden ###

Um bei einer Partie mitspielen zu können, müssen wir uns anmelden. Dieser Vorgang kann pro Partie nur zwei mal erfolgen, also solange bis zwei Spieler mitspielen wollen.

	POST /matches/:matchId/login

**Beispiel Request**

	{
		"name": "Hans"
	}

**Beispiel Response**

	Status: 200 OK
	Set-Cookie: player_id=e1tWYLbBOg; Max-Age=2592000; Path=/;

	{
		"playerId":"e1tWYLbBOg",
		"name":"Hans",
		"color":"black"
	}

Die Antwort enthält die zugewiesende `playerId` und die Spielfarbe. Die `playerId` wird bei allen nachfolgenden Requests zur Authentifzierung verwendet (Siehe Bemerkungen zur Authentifzierung) 

**Mögliche Fehler**

- `400` - Fehlerhafter Request
- `404` - Partie nicht gefunden
- `409` - Anmeldung nicht mehr möglich
- `500` - Anmeldung fehlgeschlagen

### Am SSE anmelden ###

Um über Änderungen des Spielzustands stets informiert zu bleiben, kann für jede Partie ein EventStream (SSE) erhalten werden.


	GET /matches/:matchId/event-stream

**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Eigenen Spieler abrufen ###

Als welcher Spieler man am Spiel angemeldet ist, kann unter folgender Ressource abgerufen werden. 

	GET /matches/:matchId/self

**Beispiel Response**

	Status: 200 OK

	{
		"playerId":"e1tWYLbBOg",
		"name":"Hans",
		"color":"black"
	}

**Mögliche Fehler**

- `404` - Partie nicht gefunden
- `401` - Nicht am Spiel angemeldet
		

### Gegnerischen Spieler abrufen ###

Analog zum eigenen Spieler kann auch der gegenerische abgerufen werden.

	GET /matches/:matchId/opponent

**Beispiel Response**

	Status: 200 OK

	{
		"name":"Wurst",
		"color":"black"
	}

**Mögliche Fehler**

- `404` - Partie nicht gefunden
- `401` - Nicht am Spiel angemeldet

### Aktuelles Spielfeld abrufen ###

Um das aktuelle Spielfeld darstellen zu können, kann eine Liste aller auf dem Spielfeld stehenden Figuren abgefragt werden.

	GET /matches/:matchId/board

**Beispiel Response**

	Status: 200 OK

	[
		{
			"position":{
				"column":0,
				"row":0
			},
			"figure":{
				"color":"white",
				"type":"man"
			}
		},
		{
			"position":{
				"column":0,
				"row":1
			},
			"figure":{
				"color":"white",
				"type":"rocks"
			}
		}, 
		...	
	]

**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Alle gespielten Züge abrufen ###

Um den Verlauf der Partie zu betrachten, kann eine Liste aller gespielten Züge in chronologischer Reihenfolge abgerufen werden. Über die gespielten Züge kann auch ermittelten werden, welcher Spieler an der Reihe ist.

	GET /matches/:matchId/moves

**Beispiel Response**

	Status: 200 OK

	[
		{
			"figure":{
				"color":"black",
				"type":"rocks"
			},
			"from":{
				"column":1,
				"row":5
			},
			"to":{
				"column":1,
				"row":4
			}
		},
		{
			"figure":{
				"color":"white",
				"type":"rocks"
			},
			"from":{
				"column":4,
				"row":1
			},
			"to":{
				"column":4,
				"row":2
			}
		},
		...
	]


**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Neuen Spielzug ausführen ###

Wenn wir nun einen Spielzug ausführen wollen, so senden wir ein entsprechendes `POST` mit Figur, Startposition und Ziel an die Ressource.

	POST /matches/:matchId/moves

**Beispiel Request**

	{
		"figure":{
			"color":"black",
			"type":"rocks"
		},
		"from":{
			"column":5,
			"row":5
		},
		"to":{
			"row":4,
			"column":5
		}
	}

**Response**

	Status: 201 Created

**Mögliche Fehler**

- `400` - Zug fehlgeschlagen
- `401` - Nicht am Spiel angemeldet
- `404` - Partie nicht gefunden

**Sonderfall Figur austauschen**

Wenn der nächste Zug einen Rocks an die andere Seite des Spielfeld bringt, so kann die Figur getauscht werden. Dabei muss im Request statt des Rocks bereits der Typ der Zielfigur angegeben werden. 


### Alle gültigen Spielzüge abrufen ###

Damit wir nur gültige Spielzüge ausführen, kann man eine Menge aller aktuell möglichen Züge abrufen. So entfällt eine clientseitige Implementation der Schachregeln. 

	GET /matches/:matchId/valid-moves

**Beispiel Response**

	Status: 200 OK

	[
		{
			"field":{
				"position":{"column":0,"row":0},
				"figure":{"color":"white","type":"man"}
			},
			"fields":[
				{"column":1,"row":1},
				{"column":0,"row":2},
				{"column":2,"row":2}
			]
		},
		{
			"field":{
				"position":{"column":0,"row":1},
				"figure":{"color":"white","type":"rocks"}
			},
			"fields":[
				{"column":0,"row":2}
			]
		},
		...
	]
	
Für jedes spielbare Figur (`field`) werden alle begehbaren Felder (`fields`) aufgelistet.

**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Geschlagende Spielfiguren abrufen ###

Um eine Übersicht über die geschlagene Figuren zu erhalten, rufen wir folgende Ressource auf.

	GET /matches/:matchId/captured-pieces

**Beispiel Response**

	Status: 200 OK

	[
		{
			"number":1,
			"piece":{"color":"white","type":"rocks"}
		},
		{
			"number":1,
			"piece":{"color":"white","type":"man"}
		},
		{
			"number":2,
			"piece":{"color":"black","type":"rocks"}
		}
	]

Die Antwort enthält eine Stückliste mit der Anzahl geschlagener Figurn je Art und Farbe.

**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Alle Bedrohungen abrufen ###

Um eine Menge aktuell bedrohter Figuren abzurufen kann folgende Ressource verwendet werden. Damit lassen sich Hilfsfunktionen für Einsteigerspielmodi bauen und Schachsituationen erkennen.

	GET /matches/:matchId/threats

**Beispiel Response**

	Status: 200 OK

	[
		{
			"field":{
				"position":{"column":4,"row":0},
				"figure":{"color":"white","type":"woman"}
			},
			"fields":[
				{"column":5,"row":1}
			]
		},
		{
			"field":{
				"position":{"column":4,"row":1},
				"figure":{"color":"white","type":"zenith"}
			},
			"fields":[
				{"column":5,"row":1}
			]
		},
		...
	]

Ähnlich wie bei der Menge aller möglichen Züge, sind hier alle Bedrohungen (`fields`) je Figur (`field`) aufgelistet.



**Mögliche Fehler**

- `404` - Partie nicht gefunden

### Remis ###

Über diese Ressource können Remis angeboten, akzeptiert und auch abgelehnt werden.

	PUT /matches/:matchId/draw

**Request (Remis anbieten)**

	{
		"draw":"offered"
	}

**Request (Remis akzeptieren)**

	{
		"draw":"accepted"
	}

**Request (Remis ablehnen)**

	{
		"draw":"rejected"
	}

**Response**

	Status: 201 Created

**Mögliche Fehler**

- `400` - Fehlerhafter Request
- `401` - Nicht am Spiel angemeldet
- `403` - Anfrage nicht ausgeführt (Widerspruch)
- `404` - Partie nicht gefunden


