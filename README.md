# PARALLEL-HTTP-CLIENT

Ejecutar multiples consultas en paralelo a traves de un archivo json

## Concepto

Desde un archivo .json con una estructura definida se proceden a realizar multiples peticiones en paralelo y guarda las respuestas en un archivo json `/src/json/main-response.json`

## Antes de comenzar

Se necesita modificar el archivo: `/src/json/main-request.json`
Integrar las peticiones con la siguiente estructura:

```json
[
  {
    "method": "GET",
    "url": "https://api.example.com/data",
    "token": "your_token_here"
  },
  {
    "method": "POST",
    "url": "https://api.example.com/submit",
    "body": {
      "key": "value"
    }
  },
  {
    "method": "PUT",
    "url": "https://api.example.com/update/123",
    "body": {
      "key": "new_value"
    }
  },
  {
    "method": "DELETE",
    "url": "https://api.example.com/delete/123"
  }
]
```

## Iniciar la aplicación

Es necesario ejecutar `npm install` para instalar todas las dependencias necesarias.
Despues basta con ejecutar `node src/index.js` para ejecutar el script.

## Nota importante

Nodejs necesita un puerto para ejecutar la aplicacion, tomará un puerto disponible en el servidor y luego cierra la conexion.
