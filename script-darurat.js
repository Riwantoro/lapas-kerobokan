document.addEventListener('DOMContentLoaded', function () {
    const tabelDarurat = document.getElementById('tabel-darurat').getElementsByTagName('tbody')[0];
  
    // Load data darurat dari Local Storage
    const dataDarurat = JSON.parse(localStorage.getItem('dataDarurat')) || [];
  
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
  
    // Tampilkan data darurat
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
  
    // Hapus data darurat dengan konfirmasi
    tabelDarurat.addEventListener('click', function (e) {
      if (e.target.classList.contains('hapus-data')) {
        const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
        if (konfirmasi) {
          const index = e.target.getAttribute('data-index');
          dataDarurat.splice(index, 1);
          localStorage.setItem('dataDarurat', JSON.stringify(dataDarurat));
          // Refresh tampilan data
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
      }
    });
  });