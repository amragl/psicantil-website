/**
 * Psicantil KV Seed Script
 *
 * Run ONCE to migrate existing hardcoded posts into Vercel KV.
 * Requires: KV_REST_API_URL and KV_REST_API_TOKEN env vars
 *
 * Usage: node scripts/seed-kv.js
 */

const { kv } = require('../lib/kv');

const existingPosts = [
  {
    slug: 'desarrollo-lenguaje',
    title: 'Desarrollo del lenguaje: orientaciones para favorecer el habla de tu peque desde casa',
    description: 'Pequeños gestos cotidianos marcan grandes diferencias en el desarrollo del lenguaje.',
    content: `El desarrollo del lenguaje es uno de los hitos más apasionantes de los primeros años de vida. No se trata solo de palabras: es la puerta de entrada al pensamiento, a la relación y al mundo interior del niño.\n\n## Claves para favorecer el lenguaje\n\nLa forma más natural de estimular el lenguaje es a través de la interacción cotidiana. Cuando hablas con tu hijo, **míralo a la cara**. Esta sencilla acción le comunica que lo que dice importa, que está siendo escuchado.\n\nHablarle con un vocabulario rico pero adaptado. Nombra lo que ves, lo que haces, cómo te sientes. El mundo cotidiano es el mejor libro de texto.\n\n## La importancia del turno de habla\n\nLos bebés aprenden que la conversación es un intercambio mucho antes de usar palabras. Cuando tu peque hace un sonido, espera. Dale espacio para que "responda". Esta danza comunicativa sienta las bases de toda la comunicación futura.\n\n## ¿Cuándo consultar con un especialista?\n\nCada niño tiene su ritmo. Pero si a los 12 meses no señala, no balbucea o no responde a su nombre, puede ser útil consultar con un especialista en atención temprana.`,
    category: 'Desarrollo del lenguaje',
    categoryTagClass: 'tg',
    gradient: 'linear-gradient(135deg,#D4F5E4,#A8EEC8,#6EDBA0)',
    featured: true,
    published: true,
    date: '2021-06-15',
    dateDisplay: '15 Jun 2021',
    views: 521,
    ogImage: '/assets/og-image.png',
  },
  {
    slug: 'apego-seguro',
    title: '¿Sientes lejos a tu peque? Lo que el apego seguro puede cambiar en vuestra relación',
    description: 'El apego es la conexión entre el niño y su figura de referencia. La base de todo.',
    content: `El apego es la conexión o el vínculo que se establece entre el niño y su figura de referencia. John Bowlby fue el primero en describir este sistema de conductas que garantiza la proximidad entre el bebé y quien le cuida.\n\n## ¿Qué es el apego seguro?\n\nUn niño con apego seguro tiene confianza en que sus figuras de apego estarán disponibles cuando las necesite. Esta base de seguridad le permite explorar el mundo con confianza, sabiendo que siempre puede volver a "puerto seguro".\n\n## Cómo construir el apego seguro\n\nLa **sintonía emocional** es la clave. No se trata de ser el padre o madre perfecto/a, sino de estar presente el suficiente número de veces.\n\n## La reparación como herramienta\n\nTodos perdemos los nervios. Lo que importa es la reparación: volver, nombrar lo que pasó, reconectar. Tu peque aprende que los vínculos sobreviven los conflictos — y eso es un aprendizaje para toda la vida.`,
    category: 'Apego & Vínculo',
    categoryTagClass: 'tp',
    gradient: 'linear-gradient(135deg,#EDE0FF,#C4B0F8,#9B72F5)',
    featured: false,
    published: true,
    date: '2021-02-08',
    dateDisplay: '8 Feb 2021',
    views: 654,
    ogImage: '/assets/og-image.png',
  },
  {
    slug: 'rabietas',
    title: 'Cómo manejar una rabieta sin perder la cabeza (ni la tuya ni la suya)',
    description: 'Las rabietas no son mala conducta. Son neurología. Entiéndelas y deja de sentirte desbordado/a.',
    content: `Entre los 2 y los 4 años, las rabietas son absolutamente normales. El niño está desarrollando su autonomía y al mismo tiempo no tiene aún los recursos neurológicos para gestionar emociones intensas.\n\n## ¿Por qué ocurren?\n\nEl cerebro del niño pequeño está dominado por el sistema límbico — el cerebro emocional — mientras que la corteza prefrontal no madura hasta bien entrada la adolescencia. **Literalmente no puede controlarse todavía**. Y eso no es mala conducta. Es biología.\n\n## ¿Qué puedes hacer tú?\n\n**Durante la rabieta:** mantén la calma. Estar presente sin aumentar la intensidad emocional. No razonar en ese momento — el cerebro racional está fuera de línea.\n\n**Después de la rabieta:** cuando ambos estéis calmados, nombra lo que pasó. Esto le enseña vocabulario emocional. Es el regalo más duradero que puedes hacerle.`,
    category: 'Emociones',
    categoryTagClass: 'ts',
    gradient: 'linear-gradient(135deg,#FFE8D0,#FFCB99,#FF9A5C)',
    featured: false,
    published: true,
    date: '2020-09-21',
    dateDisplay: '21 Sep 2020',
    views: 842,
    ogImage: '/assets/og-image.png',
  },
  {
    slug: 'grunidos-bebe',
    title: '¿Te preocupa que tu peque emita gruñidos? Lo que significan y cuándo preocuparse',
    description: 'Los gruñidos son una de las maneras que tienen los bebés para autorregularse. Descubre qué significan.',
    content: `Los gruñidos son una de las maneras que tienen los bebés para autorregularse, tanto emocional como físicamente. Si tu peque gruñe, no te alarmes: en la mayoría de los casos es completamente normal y forma parte de su desarrollo.\n\n## Gruñidos durante la lactancia\n\nCuando un bebé está amamantando, entra dentro de la normalidad que emita gruñiditos. Pueden deberse a que **la leche pasa muy rápido al sistema digestivo**, generando un pequeño malestar. También pueden gruñir para coger aire.\n\n## Gruñidos durante la defecación\n\nSe dan cuando los bebés están **aprendiendo a defecar**. Cuando el bebé hace esfuerzos para evacuar, emite esos gruñidos.\n\n## Gruñidos como comunicación\n\nCualquier ruido que el bebé emita — gorjeos, balbuceo, risas y chillidos — en una edad temprana puede ser **a modo de comunicación**, y los gruñidos no son menos.\n\n## Gruñidos y oxigenación\n\nLos gruñidos pueden provocar un efecto parecido al de un bostezo: **sirven para oxigenar los pulmones**. Cuando un bebé gruñe durante el sueño, inmediatamente después suele respirar en profundidad.`,
    category: 'Desarrollo del bebé',
    categoryTagClass: 'tsk',
    gradient: 'linear-gradient(135deg,#D4F0F5,#A8E4EC,#6ECFD8)',
    featured: false,
    published: true,
    date: '2020-11-10',
    dateDisplay: '10 Nov 2020',
    views: 378,
    ogImage: '/assets/og-image.png',
  },
  {
    slug: 'como-dormir-bebe',
    title: '¿Cómo dormir a tu bebé? Entiende sus ciclos de sueño',
    description: 'Los ciclos de sueño del bebé son más cortos de lo que crees. Comprender sus fases cambia todo.',
    content: `Antes de saber cómo puedes dormir a tu bebé, es necesario entender su ciclo de sueño, el cual varía bastante desde que nace hasta que cumple el primer año.\n\n## Los ciclos de sueño según la edad\n\nEn los más pequeños, los ciclos de sueño son más cortos que en los adultos. Un recién nacido tiene ciclos de **entre 45 y 60 minutos**, mientras que en la edad escolar se alargan hasta unos 90 minutos.\n\n## Consejos para favorecer el sueño\n\nUna buena forma de que no se despierte en mitad de la noche es **mantenerlo activo durante el día**. Jugar con él, mostrarle sus juguetes y evitar que duerma demasiado durante el día.\n\nProcura que la **rutina a la hora de acostarse sea constante y placentera**. Mantén las actividades en el mismo orden cada noche.\n\n## Paciencia ante todo\n\nSi tu bebé se despierta frecuentemente, recuerda que es **biológicamente normal**. No estás haciendo nada mal. Con el tiempo, sus ciclos de sueño madurarán.`,
    category: 'Sueño infantil',
    categoryTagClass: 'tsl',
    gradient: 'linear-gradient(135deg,#E0E8FF,#B0C4F8,#7290F5)',
    featured: false,
    published: true,
    date: '2021-01-18',
    dateDisplay: '18 Ene 2021',
    views: 489,
    ogImage: '/assets/og-image.png',
  },
  {
    slug: 'poner-limites',
    title: '¿Cómo poner límites a los niños? Según su edad y desarrollo',
    description: 'No es lo mismo dirigirse a un niño de 2 años que a uno de 5. Adapta el mensaje a su fase de desarrollo.',
    content: `Para saber cómo poner límites a los niños, se debe considerar que en la infancia hay fases de desarrollo según la edad. No es lo mismo emitir un mensaje a un niño entre uno y tres años que a un niño entre cuatro y siete años.\n\n## Primera fase: de 1 a 3 años\n\nEn esta primera fase, el pequeño mantiene **muy poca atención cuando se le habla**. Por eso es importante dirigirse a ellos con frases cortas, repetidas varias veces.\n\n## A partir de los 3 años\n\nA partir de los tres años, el niño ya es capaz de **fijar más atención a lo que se le dice**. Tendrás que ser muy claro al hablar con él e intentar ponerle límites de forma firme pero cariñosa.\n\n## ¿Qué tener en cuenta?\n\nPara poner límites y normas se deben tener en cuenta distintos aspectos: la **edad cronológica** del niño, su **nivel de madurez**, sus **capacidades** y la **situación familiar**.\n\n## Límites con amor\n\nPoner límites no es castigar ni ser autoritario. Es ofrecer al niño un marco seguro en el que crecer.`,
    category: 'Crianza',
    categoryTagClass: 'tc',
    gradient: 'linear-gradient(135deg,#FFF0D4,#FFD699,#FFBC5C)',
    featured: false,
    published: true,
    date: '2021-04-05',
    dateDisplay: '5 Abr 2021',
    views: 712,
    ogImage: '/assets/og-image.png',
  },
];

const categories = [
  { name: 'Desarrollo del lenguaje', tagClass: 'tg', color: '#16B05A' },
  { name: 'Apego & Vínculo', tagClass: 'tp', color: '#7C3AED' },
  { name: 'Emociones', tagClass: 'ts', color: '#FF6A30' },
  { name: 'Desarrollo del bebé', tagClass: 'tsk', color: '#0088BB' },
  { name: 'Sueño infantil', tagClass: 'tsl', color: '#7290F5' },
  { name: 'Crianza', tagClass: 'tc', color: '#FFA800' },
];

async function seed() {
  const now = new Date().toISOString();

  // Seed posts
  const slugs = existingPosts.map(p => p.slug);
  await kv.set('posts:index', slugs);
  console.log(`Set posts:index with ${slugs.length} slugs`);

  for (const post of existingPosts) {
    const fullPost = {
      ...post,
      createdAt: now,
      updatedAt: now,
    };
    await kv.set(`post:${post.slug}`, fullPost);
    console.log(`  Seeded: post:${post.slug}`);
  }

  // Seed categories
  await kv.set('categories', categories);
  console.log(`Set categories with ${categories.length} entries`);

  // Seed settings
  await kv.set('settings', {
    siteTitle: 'Psicantil',
    siteDescription: 'Psicología infantil por Cristina Góngora González',
    lastDeployAt: null,
    lastDeployStatus: null,
  });
  console.log('Set settings');

  console.log(`\nSeed complete: ${slugs.length} posts, ${categories.length} categories`);
  await kv.close();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
