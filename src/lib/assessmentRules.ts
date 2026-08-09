export const DAMAGE_LEVELS = [
  { label: "Tidak Rusak", value: 0.00 },
  { label: "Rusak Sangat Ringan", value: 0.20 },
  { label: "Rusak Ringan", value: 0.35 },
  { label: "Rusak Sedang", value: 0.50 },
  { label: "Rusak Berat", value: 0.70 },
  { label: "Rusak Sangat Berat", value: 0.85 },
  { label: "Komponen Tidak Sesuai", value: 1.00 },
];

export const WEIGHTS_BY_FLOOR: Record<number, Record<string, number>> = {
  1: {
    'str-pondasi': 12.0,
    'str-kolom': 10.0,
    'str-balok': 8.0,
    'str-atap': 7.0,
    'ars-dinding': 21.5,
    'ars-plafon': 10.0,
    'ars-lantai': 14.5,
    'ars-kusen': 1.0,
    'ars-pintu': 1.5,
    'ars-jendela': 2.0,
    'ars-fin-plafon': 3.0,
    'ars-fin-dinding': 4.0,
    'ars-fin-kusen': 2.0,
    'utl-listrik': 1.0,
    'utl-air': 1.0,
    'utl-drainase': 1.5,
  },
  2: {
    'str-pondasi': 10.0,
    'str-kolom': 13.0,
    'str-balok': 12.0,
    'str-plat': 7.0,
    'str-tangga': 3.0,
    'str-atap': 10.0,
    'ars-dinding': 15.0,
    'ars-plafon': 6.0,
    'ars-lantai': 9.0,
    'ars-kusen': 1.5,
    'ars-pintu': 1.0,
    'ars-jendela': 1.25,
    'ars-fin-plafon': 1.0,
    'ars-fin-dinding': 5.0,
    'ars-fin-kusen': 1.0,
    'utl-listrik': 2.0,
    'utl-air': 1.0,
    'utl-drainase': 1.25,
  },
  3: {
    'str-pondasi': 10.0,
    'str-kolom': 13.0,
    'str-balok': 12.0,
    'str-plat': 10.0,
    'str-tangga': 3.0,
    'str-atap': 7.0,
    'ars-dinding': 6.25,
    'ars-plafon': 8.0,
    'ars-lantai': 10.0,
    'ars-kusen': 1.5,
    'ars-pintu': 1.0,
    'ars-jendela': 1.25,
    'ars-fin-plafon': 3.0,
    'ars-fin-dinding': 5.0,
    'ars-fin-kusen': 3.0,
    'utl-listrik': 3.0,
    'utl-air': 1.5,
    'utl-drainase': 1.5,
  }
};

export interface ComponentItem {
  id: string;
  name: string;
  unit: string;
  minFloor?: number;
}

export interface ComponentGroup {
  id: string;
  title: string;
  items: ComponentItem[];
}

export const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'str',
    title: 'Struktur',
    items: [
      { id: 'str-pondasi', name: 'Pondasi & Sloof', unit: 'Estimasi' },
      { id: 'str-kolom', name: 'Kolom', unit: 'unit' },
      { id: 'str-balok', name: 'Balok', unit: 'unit' },
      { id: 'str-plat', name: 'Plat Lantai', unit: 'unit', minFloor: 2 },
      { id: 'str-tangga', name: 'Tangga', unit: 'unit', minFloor: 2 },
      { id: 'str-atap', name: 'Atap', unit: '%' },
    ]
  },
  {
    id: 'ars',
    title: 'Arsitektur',
    items: [
      { id: 'ars-dinding', name: 'Dinding / Partisi', unit: '%' },
      { id: 'ars-plafon', name: 'Plafond', unit: '%' },
      { id: 'ars-lantai', name: 'Lantai', unit: '%' },
      { id: 'ars-kusen', name: 'Kusen', unit: 'unit' },
      { id: 'ars-pintu', name: 'Pintu', unit: 'unit' },
      { id: 'ars-jendela', name: 'Jendela', unit: 'unit' },
      { id: 'ars-fin-plafon', name: 'Finishing Plafond', unit: '%' },
      { id: 'ars-fin-dinding', name: 'Finishing Dinding', unit: '%' },
      { id: 'ars-fin-kusen', name: 'Finishing Kusen & Pintu', unit: '%' },
    ]
  },
  {
    id: 'utl',
    title: 'Utilitas',
    items: [
      { id: 'utl-listrik', name: 'Instalasi Listrik', unit: 'Estimasi' },
      { id: 'utl-air', name: 'Instalasi Air Bersih', unit: 'Estimasi' },
      { id: 'utl-drainase', name: 'Drainase Limbah', unit: 'm1' },
    ]
  }
];

export function getDamageCategory(percentage: number) {
  if (percentage === 0) return 'Tidak Rusak';
  if (percentage <= 30) return 'Rusak Ringan';
  if (percentage <= 45) return 'Rusak Sedang';
  return 'Rusak Berat';
}

export interface DamageGuide {
  [level: string]: string;
}

export const COMPONENT_DAMAGE_GUIDES: Record<string, DamageGuide> = {
  'str-pondasi': {
    '0': 'Tidak ada kerusakan terlihat pada struktur pondasi dan sloof.',
    '0.2': 'Retak rambut pada selimut beton sloof (lebar < 0.1 mm), tidak ada penurunan.',
    '0.35': 'Retak pada selimut beton (lebar 0.1 - 1 mm) dan ada sedikit penurunan (sedikit miring).',
    '0.5': 'Penurunan pondasi yang terlihat jelas (miring), retak struktural pada sloof (lebar > 1 mm).',
    '0.7': 'Pondasi patah, terjadi beda penurunan (differential settlement) yang besar, bangunan sangat miring.',
    '0.85': 'Pondasi dan sloof hancur, struktur atas terancam roboh.',
    '1': 'Spesifikasi material atau dimensi pondasi tidak sesuai dengan standar teknis.'
  },
  'str-kolom': {
    '0': 'Tidak ada retak atau spalling pada kolom.',
    '0.2': 'Retak rambut pada plesteran/selimut beton (lebar < 0.1 mm).',
    '0.35': 'Retak pada selimut beton (0.1 - 1 mm), tidak sampai ke tulangan.',
    '0.5': 'Retak struktural lebar (> 1 mm), selimut beton terkelupas, tulangan mulai terlihat.',
    '0.7': 'Tulangan utama melengkung (buckling), inti beton hancur (crushing), kolom miring.',
    '0.85': 'Kolom patah atau hancur, kehilangan kapasitas dukung secara total.',
    '1': 'Dimensi kolom kurang dari standar (misal: kolom praktis digunakan untuk struktur utama) atau jumlah tulangan kurang.'
  },
  'str-balok': {
    '0': 'Tidak ada kerusakan pada balok.',
    '0.2': 'Retak rambut pada plesteran/selimut beton balok.',
    '0.35': 'Retak lentur atau geser kecil pada selimut beton (0.1 - 1 mm).',
    '0.5': 'Retak struktural tembus, tulangan terlihat, lendutan (defleksi) balok mulai terlihat.',
    '0.7': 'Lendutan sangat besar, beton hancur pada daerah tekan, tulangan putus atau terlepas.',
    '0.85': 'Balok patah/runtuh dan menimpa lantai di bawahnya.',
    '1': 'Ukuran balok tidak memenuhi syarat bentang, atau detail penulangan salah.'
  },
  'str-plat': {
    '0': 'Plat lantai dalam kondisi baik, tidak ada retak atau lendutan.',
    '0.2': 'Retak rambut acak pada permukaan bawah plat.',
    '0.35': 'Retak tembus kecil, ada rembesan air jika berada di atap dak.',
    '0.5': 'Lendutan plat terlihat jelas, tulangan bawah terekspos karena spalling beton.',
    '0.7': 'Plat melengkung parah, tulangan putus, beton hancur (punching shear).',
    '0.85': 'Plat lantai runtuh sebagian atau keseluruhan.',
    '1': 'Tebal plat kurang dari standar minimum atau menggunakan wiremesh yang tidak sesuai beban.'
  },
  'str-tangga': {
    '0': 'Tangga utuh dan stabil.',
    '0.2': 'Retak rambut pada pelat tangga atau injakan.',
    '0.35': 'Retak pada pertemuan tangga dengan balok bordes.',
    '0.5': 'Retak struktural lebar, tulangan terlihat, tangga terasa bergetar hebat saat dilewati.',
    '0.7': 'Patahan pada pelat tangga atau balok utama tangga.',
    '0.85': 'Tangga runtuh, akses terputus.',
    '1': 'Dimensi injakan/tanjakan tidak standar (berbahaya), atau kemiringan terlalu curam.'
  },
  'str-atap': {
    '0': 'Struktur rangka atap utuh dan lurus.',
    '0.2': 'Sedikit lendutan pada gording atau reng, tidak ada indikasi patah.',
    '0.35': 'Rangka atap (kayu/baja ringan) melendut, ada sambungan yang mulai kendor/karat.',
    '0.5': 'Beberapa elemen kuda-kuda patah (kayu busuk/rayap, baja ringan melengkung).',
    '0.7': 'Kuda-kuda utama patah atau melengkung ekstrim, bentuk atap berubah drastis.',
    '0.85': 'Rangka atap runtuh sebagian atau seluruhnya.',
    '1': 'Jarak kuda-kuda terlalu jauh, ukuran profil terlalu kecil, atau sambungan tidak standar.'
  },
  'ars-dinding': {
    '0': 'Dinding utuh, tidak retak, plesteran baik.',
    '0.2': 'Retak rambut pada plesteran (non-struktural).',
    '0.35': 'Retak tembus pada bata, plesteran terkelupas di beberapa tempat.',
    '0.5': 'Dinding miring, retak diagonal besar (retak geser gempa), sebagian bata rontok.',
    '0.7': 'Sebagian besar dinding roboh atau sangat rawan roboh jika disentuh.',
    '0.85': 'Seluruh dinding runtuh rata dengan lantai.',
    '1': 'Penggunaan material dinding yang tidak standar atau dinding tanpa ring balok/kolom praktis.'
  },
  'ars-plafon': {
    '0': 'Plafon utuh, rata, dan bersih.',
    '0.2': 'Terdapat noda air kecil atau retak rambut pada sambungan.',
    '0.35': 'Plafon melendut sebagian, multiplek mengelupas atau gypsum retak lebar.',
    '0.5': 'Sebagian panel plafon lepas atau jatuh, rangka plafon terlihat berkarat/lapuk.',
    '0.7': 'Sebagian besar plafon (lebih dari 50%) runtuh beserta rangkanya.',
    '0.85': 'Seluruh sistem plafon dan rangka penahannya runtuh total.',
    '1': 'Material plafon sangat mudah terbakar atau rangka dipasang serampangan.'
  },
  'ars-lantai': {
    '0': 'Penutup lantai (keramik/tegel) utuh dan rata.',
    '0.2': 'Goresan ringan, nat kotor atau beberapa ubin '+"'"+'popping'+"'"+' (kopong).',
    '0.35': 'Banyak keramik pecah, retak, atau terlepas dari dasarnya.',
    '0.5': 'Permukaan lantai bergelombang/ambles akibat penurunan urugan tanah di bawahnya.',
    '0.7': 'Lantai hancur total, ambles dalam, atau material penutup hilang.',
    '0.85': 'Struktur dasar penyangga lantai hancur sehingga tidak bisa dipijak.',
    '1': 'Material lantai licin untuk area basah atau tidak sesuai spesifikasi ruang.'
  },
  'ars-kusen': {
    '0': 'Kusen pintu/jendela kokoh, lurus, dan berfungsi baik.',
    '0.2': 'Goresan atau cacat visual kecil, tidak mempengaruhi struktur kusen.',
    '0.35': 'Kusen memuai/susut menyulitkan penutupan, atau mulai ada serangan rayap kecil.',
    '0.5': 'Kusen keropos sebagian (lapuk/rayap) atau melengkung tajam akibat beban.',
    '0.7': 'Kusen hancur, patah, atau lepas dari dinding.',
    '0.85': 'Seluruh sistem kusen lenyap atau hancur total.',
    '1': 'Bahan kusen sangat rentan atau dimensi terlalu kecil untuk menahan beban daun pintu/jendela.'
  },
  'ars-pintu': {
    '0': 'Daun pintu berfungsi sempurna.',
    '0.2': 'Engsel agak macet atau cat terkelupas.',
    '0.35': 'Panel pintu retak, muai/susut ekstrim, sulit dikunci.',
    '0.5': 'Pintu berlubang, keropos parah, atau engsel patah.',
    '0.7': 'Daun pintu hancur atau terlepas sepenuhnya dari kusen.',
    '0.85': 'Daun pintu hilang atau tidak tersisa bentuk aslinya.',
    '1': 'Bahan pintu tidak sesuai peruntukan (misal pintu indoor untuk outdoor hujan).'
  },
  'ars-jendela': {
    '0': 'Jendela dan kaca utuh.',
    '0.2': 'Kaca buram permanen, engsel jendela kaku.',
    '0.35': 'Retak pada kaca, bingkai jendela agak lapuk/karat.',
    '0.5': 'Kaca pecah sebagian, bingkai jendela patah/keropos.',
    '0.7': 'Kaca pecah total, bingkai hancur atau terlepas.',
    '0.85': 'Seluruh komponen jendela hilang/hancur.',
    '1': 'Penggunaan kaca tipis non-tempered pada area risiko benturan tinggi.'
  },
  'ars-fin-plafon': {
    '0': 'Finishing/cat plafon rata dan bersih.',
    '0.2': 'Warna memudar atau kusam ringan.',
    '0.35': 'Cat mengelupas di beberapa spot, ada noda jamur.',
    '0.5': 'Cat mengelupas luas, plamir hancur, berjamur parah.',
    '0.7': 'Seluruh lapisan finishing rusak, lapisan dasar terekspos.',
    '0.85': 'Tidak ada material finishing yang tersisa dengan baik.',
    '1': 'Cat mengandung material berbahaya/beracun atau tidak sesuai untuk interior.'
  },
  'ars-fin-dinding': {
    '0': 'Finishing/cat dinding rata dan bersih.',
    '0.2': 'Warna memudar, retak rambut pada cat.',
    '0.35': 'Cat mengelupas, menggelembung (blistering), atau berjamur.',
    '0.5': 'Cat mengelupas luas hingga ke plesteran, rembesan air parah.',
    '0.7': 'Finishing hancur total bersamaan dengan rusaknya lapisan plesteran.',
    '0.85': 'Tidak ada lapisan finishing yang tersisa.',
    '1': 'Salah menggunakan cat (cat interior untuk eksterior) sehingga rusak seketika.'
  },
  'ars-fin-kusen': {
    '0': 'Finishing kusen (cat/politur) rata dan baik.',
    '0.2': 'Memudar atau goresan ringan.',
    '0.35': 'Politur/cat mengelupas di beberapa bagian.',
    '0.5': 'Cat terkelupas luas, kayu dasar terekspos cuaca.',
    '0.7': 'Finishing hancur total, material dasar mulai ikut rusak.',
    '0.85': 'Tidak tersisa finishing pelindung.',
    '1': 'Tidak ada finishing pelindung untuk kayu/besi sama sekali sejak awal.'
  },
  'utl-listrik': {
    '0': 'Sistem instalasi listrik berfungsi normal dan aman.',
    '0.2': 'Beberapa saklar/stop kontak kotor atau kendor penutupnya.',
    '0.35': 'Beberapa titik lampu mati, kabel luar sedikit terkelupas bungkus luarnya.',
    '0.5': 'Sering terjadi korsleting, panel MCB bermasalah, banyak kabel terbuka berbahaya.',
    '0.7': 'Sebagian besar instalasi hangus terbakar atau putus, tidak bisa digunakan.',
    '0.85': 'Seluruh sistem kelistrikan hancur/hilang.',
    '1': 'Kabel tidak standar SNI, ukuran penampang kabel terlalu kecil untuk beban.'
  },
  'utl-air': {
    '0': 'Instalasi air bersih lancar dan tidak bocor.',
    '0.2': 'Kran agak keras/menetes sedikit, tekanan air kadang lemah.',
    '0.35': 'Kebocoran kecil pada sambungan pipa, keran rusak.',
    '0.5': 'Pipa utama bocor besar, air terbuang deras, pompa air mati.',
    '0.7': 'Jaringan pipa hancur, distribusi air mati total.',
    '0.85': 'Seluruh sistem air bersih lenyap atau hancur.',
    '1': 'Pipa menggunakan material beracun (misal timbal) atau spek tekanan terlalu rendah.'
  },
  'utl-drainase': {
    '0': 'Saluran pembuangan lancar, tidak ada genangan.',
    '0.2': 'Saluran kotor, aliran lambat tapi masih mengalir.',
    '0.35': 'Sumbatan sebagian, genangan air saat hujan lebat.',
    '0.5': 'Pipa drainase pecah/bocor, saluran tersumbat total, air meluap kotor.',
    '0.7': 'Sistem drainase hancur, air limbah/hujan masuk ke dalam bangunan.',
    '0.85': 'Saluran drainase hilang/tertimbun total.',
    '1': 'Kemiringan pipa salah (air berbalik arah) atau ukuran pipa terlalu kecil.'
  }
};
