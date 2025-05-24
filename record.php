<?php
$recordsFile = 'record.json';
header('Content-Type: application/json');

// Gestione della richiesta in base al metodo HTTP
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Restituisce i record presenti nel file record.json
    if (file_exists($recordsFile)) {
        $json = file_get_contents($recordsFile);
        echo $json;
    } else {
        echo json_encode([]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Riceve i dati JSON del nuovo record dal corpo della richiesta
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON non valido']);
        exit();
    }
    // Carica i record esistenti, se il file esiste
    if (file_exists($recordsFile)) {
        $recordsJson = file_get_contents($recordsFile);
        $records = json_decode($recordsJson, true);
        if (!is_array($records)) {
            $records = [];
        }
    } else {
        $records = [];
    }
    // Aggiunge il nuovo record
    $records[] = $data;
    // Salva i record aggiornati nel file record.json
    if (file_put_contents($recordsFile, json_encode($records, JSON_PRETTY_PRINT))) {
        echo json_encode(['message' => 'Record salvato con successo']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Errore durante il salvataggio del record']);
    }
}
?>
