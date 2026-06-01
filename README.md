# LaserCut Pro - Tienda online de corte laser

Proyecto listo para subir a GitHub y desplegar en Vercel.

## Que incluye

- Pagina principal con estetica industrial.
- Catalogo de productos y servicios.
- Filtro por categorias.
- Buscador.
- Carrito de compras.
- Boton de consulta por WhatsApp.
- Boton preparado para Mercado Pago.
- Panel simple para cargar productos desde la pagina.
- Persistencia local en el navegador usando `localStorage`.
- Funciones testeables para carrito, formulario y filtros.

## Como ejecutarlo en tu PC

1. Descomprimir el ZIP.
2. Entrar a la carpeta:

```bash
cd lasercut-pro-tienda
```

3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar en modo desarrollo:

```bash
npm run dev
```

5. Abrir en el navegador:

```text
http://localhost:3000
```

## Como cambiar el numero de WhatsApp

1. Copiar `.env.example` y renombrarlo como `.env.local`.
2. Cambiar el numero:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=5493410000000
```

Usa formato internacional sin signos, sin espacios y sin guiones.

## Como subirlo a GitHub

```bash
git init
git add .
git commit -m "Primera version LaserCut Pro"
```

Despues creas un repositorio en GitHub, copias los comandos que GitHub te da y haces push.

## Como subirlo a Vercel

1. Entrar a Vercel.
2. Add New Project.
3. Importar el repositorio de GitHub.
4. Tocar Deploy.

## Tests

Para ejecutar pruebas:

```bash
npm run test
```

## Pendientes para version real

- Conectar productos a una base de datos.
- Agregar login real para administrador.
- Integrar Mercado Pago.
- Subir fotos propias de maquinas laser.
- Agregar dominio propio.
- Configurar Google Search Console.
# TIENDA-1
# TIENDA1
