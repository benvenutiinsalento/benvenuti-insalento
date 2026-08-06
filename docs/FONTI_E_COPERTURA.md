# Fonti e copertura

Il file `data/source-registry.json` contiene le fonti trasversali iniziali. Il bootstrap usa il dataset IPA per sostituire i siti comunali candidati con gli indirizzi istituzionali verificati e censisce i canali social ufficiali dichiarati nell'IPA.

Ogni Comune riceve una fonte di discovery separata. Le pagine e i documenti trovati diventano fonti autonome, così un parser rotto non blocca l'intera provincia.

Le Pro Loco presenti in `data/pro-loco-registry.json` sono candidati da verificare, non fonti automaticamente attendibili. Il sistema conserva il riferimento al registro e richiede l'identificazione del sito o canale ufficiale.

## Nessun inserimento manuale privilegiato
MEDinFEST, Andrano o altri esempi non sono presenti come seed dedicati. Un evento entra nel database soltanto attraverso una fonte registrata o una segnalazione sottoposta a verifica.
