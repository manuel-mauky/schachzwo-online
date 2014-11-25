
# REST API

----------
 
## Allgemeines

### Zugriff


Der Zugriff auf die REST API erfolgt über folgenden URL:

	http://schachzwo.inf.hszg.de

Alle Pfadenangaben dieser Dokumentation sind relativ zu dieser URL.

### Authentifzierung

TODO Authentifzierung erklären

### Server-Sent Events

TODO kurze Beschreibung und Auflistung aller Eventtypen

## Ressourcen

Die Hauptressource und zugleich Einstiegspunkt des Webservices ist die Spielpartien-Ressource (`matches`). Alle untergeordneten Ressourcen sind wie folgt strukturiert

- `/matches`
	- **POST** (neue Partie anlegen)
	- `/:matchId`
		- **GET** (Partie abrufen)
		- `/board`
			- **GET** (aktuelles Spielfeld abrufen)
		- `/captured-pieces`
			- **GET** (geschlagende Spielfiguren abrufen)
		- `/draw`
			- **PUT** (Remis anbieten)
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
			- **GET** (alle Bedrohungen des Königs abrufen)
		- `/valid-moves`
			- **GET** (alle gültigen Spielzüge abrufen)

Nachfolgend werden alle einzelnen Ressourcen in Reihenfolge des Workflows erläutert.

### Neue Partie anlegen ###

Zunächst müssen wir eine Partie anlegen. Dazu führen wir ein HTTP-POST auf `\matches' aus. Bei SchachZwo kann man entweder eine 7x7 oder eine 9x9 Variante spielen. Somit übergeben wir ein JSON-Objekt, welches ein Feld mit der Spielfeldgröße beeinhaltet.   

	POST /matches

#### Beispiel Request (7x7 Partie) 

	{
		size: 7
	}

#### Beispiel Request (9x9 Partie) 

	{
		size: 9
	}

#### Beispiel Response

	Status: 201 (Created)
	Location: /lJyMJEZB_x 

	{
		"matchId": "lJyMJEZB_x"
		"state": "preparing"
		"size": 7
	}

Die Antwort enthält die `matchId` die jetzt bei allen Subresourcen angegeben werden muss.


		
### An der Partie anmelden ###

Um bei einer Partie mitspielen zu können, müssen wir uns anmelden. Dieser Vorgang kann pro Partie nur zwei mal erfolgen, also solange bis zwei Spieler mitspielen wollen.

	POST /matches/:matchId/login

#### Beispiel Request

	{
		"name": "Hans"
	}

#### Beispiel Response

	Status: 200 OK
	Set-Cookie: player_id=e1tWYLbBOg; Max-Age=2592000; Path=/;

	{
		"playerId":"e1tWYLbBOg",
		"name":"Hans",
		"color":"black"
	}

Die Antwort enthält die zugewiesende `playerId` und die Spielfarbe. Die `playerId` wird bei allen nachfolgenden Requests zur Authentifzierung verwendet (Siehe Authentifzierung) 

### Am SSE anmelden ###

Um über Änderungen des Spielzustands stets informiert zu bleiben, kann für jede Partie ein EventStream (SSE) abgerufen werden.


	GET /matches/:matchId/event-stream

### Partie abrufen ###

Wir können die angelegte Partie auch abrufen:

	GET /matches/:matchId

#### Beispiel Response

	Status: 200 OK

	{
		"matchId": "lJyMJEZB_x"
		"state": "preparing"
		"size": 7
	}






