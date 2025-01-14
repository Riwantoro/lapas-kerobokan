document.addEventListener('DOMContentLoaded', async function () {
  const tabelDarurat = document.getElementById('tabel-darurat').getElementsByTagName('tbody')[0];

  // Load data dari Firebase
  let dataDarurat = await window.db.getAllDarurat();
  dataDarurat = Array.isArray(dataDarurat) ? dataDarurat : [];

    // Fungsi untuk mengonversi vonis ke format "X tahun Y bulan"
    function formatVonis(vonis) {
      const tahun = Math.floor(vonis);
      const bulan = Math.round((vonis - tahun) * 12);
      return `${tahun} tahun ${bulan} bulan`;
    }
  
    // Fungsi untuk menghitung tanggal selesai vonis
    function hitungBebasMurni(tanggalPenangkapan, vonis) {
      const tanggalPenangkapanObj = new Date(tanggalPenangkapan);
      const tahun = Math.floor(vonis);
      const bulan = Math.round((vonis - tahun) * 12);
  
      // Tambahkan tahun dan bulan ke tanggal penangkapan
      tanggalPenangkapanObj.setFullYear(tanggalPenangkapanObj.getFullYear() + tahun);
      tanggalPenangkapanObj.setMonth(tanggalPenangkapanObj.getMonth() + bulan);
  
      // Format tanggal ke "YYYY-MM-DD"
      const tahunBebas = tanggalPenangkapanObj.getFullYear();
      const bulanBebas = String(tanggalPenangkapanObj.getMonth() + 1).padStart(2, '0');
      const hariBebas = String(tanggalPenangkapanObj.getDate()).padStart(2, '0');
  
      return `${tahunBebas}-${bulanBebas}-${hariBebas}`;
    }
  

// ganti 1
 // Tampilkan data darurat
// Tampilkan data darurat
async function tampilkanDataDarurat() {
  tabelDarurat.innerHTML = '';
  dataDarurat.forEach((item, index) => {
    const barisBaru = tabelDarurat.insertRow();
    const bebasMurni = hitungBebasMurni(item.tanggalPenangkapan, item.vonis);

    barisBaru.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.nama}</td>
    <td>${formatVonis(item.vonis)}</td>
    <td>${item.banding}</td>
    <td>${item.tanggalPenangkapan}</td>
    <td class="bebas-murni">${bebasMurni}</td>
    <td>
      <button class="btn btn-danger btn-sm hapus-data" data-index="${index}">Hapus</button>
    </td>
  `;
});
}

tampilkanDataDarurat();

// Hapus data darurat
tabelDarurat.addEventListener('click', async function (e) {
  if (e.target.classList.contains('hapus-data')) {
    const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
    if (konfirmasi) {
      try {
        const index = e.target.getAttribute('data-index');
        dataDarurat.splice(index, 1);
        await window.db.saveDarurat(dataDarurat);
        tampilkanDataDarurat();
      } catch (error) {
        alert('Gagal menghapus data: ' + error.message);
      }
    }
  }
});
});