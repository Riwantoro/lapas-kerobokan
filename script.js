document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-sidang');
  const tabelTahanan = document.getElementById('tabel-tahanan').getElementsByTagName('tbody')[0];
  const tabelData = document.getElementById('tabel-data').getElementsByTagName('tbody')[0];
  const notifikasi = document.getElementById('notifikasi');
  const inputCari = document.getElementById('cari-tahanan');
  let nomorUrut = 1;

  // Load data dari Local Storage
  let dataTahanan = JSON.parse(localStorage.getItem('dataTahanan')) || [];
  let dataDarurat = JSON.parse(localStorage.getItem('dataDarurat')) || [];

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

  // Fungsi untuk menampilkan data di tabel
  function tampilkanData(data) {
    tabelData.innerHTML = '';
    data.forEach((item, index) => {
      const barisBaru = tabelData.insertRow();
      barisBaru.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${formatVonis(item.vonis)}</td>
        <td>${item.banding}</td>
        <td>${item.tanggalPenangkapan}</td>
        <td>
          <button class="btn btn-danger btn-sm hapus-data" data-index="${index}">Hapus</button>
        </td>
      `;
    });
  }

  // Tampilkan data saat halaman dimuat
  tampilkanData(dataTahanan);

  // Tambah baris
  document.getElementById('tambah-baris').addEventListener('click', function () {
    if (tabelTahanan.rows.length < 100) {
      const barisBaru = tabelTahanan.insertRow();
      barisBaru.innerHTML = `
        <td>${nomorUrut}</td>
        <td><input type="text" class="form-control" required></td>
        <td><input type="number" step="0.1" class="form-control vonis" required></td>
        <td>
          <select class="form-select" required>
            <option value="">Pilih</option>
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </td>
        <td><input type="date" class="form-control tanggal-penangkapan" required></td>
        <td><button type="button" class="btn btn-danger btn-sm hapus-baris">Hapus</button></td>
      `;
      nomorUrut++;
    } else {
      alert('Maksimal 100 tahanan per sidang.');
    }
  });

  // Hapus baris input
  tabelTahanan.addEventListener('click', function (e) {
    if (e.target.classList.contains('hapus-baris')) {
      e.target.closest('tr').remove();
      nomorUrut--;
    }
  });

  // Simpan data
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = [];
    const rows = tabelTahanan.rows;

    // Ambil data dari tabel input
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nama = row.cells[1].querySelector('input').value;
      const vonis = parseFloat(row.cells[2].querySelector('input').value);
      const banding = row.cells[3].querySelector('select').value;
      const tanggalPenangkapan = row.cells[4].querySelector('input').value;

      data.push({ nama, vonis, banding, tanggalPenangkapan });

      // Cek vonis di bawah 1 tahun 6 bulan
      if (vonis < 1.5) {
        dataDarurat.push({ nama, vonis, banding, tanggalPenangkapan });
        alert(`Peringatan: ${nama} memiliki vonis di bawah 1 tahun 6 bulan!`);
      }
    }

    // Simpan data ke Local Storage
    dataTahanan = dataTahanan.concat(data);
    localStorage.setItem('dataTahanan', JSON.stringify(dataTahanan));
    localStorage.setItem('dataDarurat', JSON.stringify(dataDarurat));

    // Tampilkan data
    tampilkanData(dataTahanan);

    // Tampilkan notifikasi
    notifikasi.textContent = 'Data berhasil disimpan!';
    notifikasi.classList.remove('d-none');
    setTimeout(() => notifikasi.classList.add('d-none'), 3000);

    // Reset form input
    tabelTahanan.innerHTML = '';
    nomorUrut = 1;
  });

  // Hapus data dengan konfirmasi
  tabelData.addEventListener('click', function (e) {
    if (e.target.classList.contains('hapus-data')) {
      const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
      if (konfirmasi) {
        const index = e.target.getAttribute('data-index');
        dataTahanan.splice(index, 1);
        localStorage.setItem('dataTahanan', JSON.stringify(dataTahanan));
        tampilkanData(dataTahanan);
      }
    }
  });

  // Fitur Pencarian
  inputCari.addEventListener('input', function () {
    const keyword = inputCari.value.toLowerCase();
    const hasilPencarian = dataTahanan.filter(item => item.nama.toLowerCase().includes(keyword));
    tampilkanData(hasilPencarian);
  });
});