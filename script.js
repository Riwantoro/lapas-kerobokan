import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', async function() {
  const form = document.getElementById('form-sidang');
  const tabelTahanan = document.getElementById('tabel-tahanan').getElementsByTagName('tbody')[0];
  const tabelData = document.getElementById('tabel-data').getElementsByTagName('tbody')[0];
  const notifikasi = document.getElementById('notifikasi');
  const inputCari = document.getElementById('cari-tahanan');
  let nomorUrut = 1;

  // Ambil referensi database
  const database = window.db.database;

  // Fungsi untuk mengambil data dari Firebase
  async function getDataFromFirebase(path) {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, path));
    return snapshot.exists() ? snapshot.val() : [];
  }

  // Load data awal
  let dataTahanan = await getDataFromFirebase('tahanan');
  let dataDarurat = await getDataFromFirebase('darurat');

  // Konversi data ke array jika bukan array
  dataTahanan = Array.isArray(dataTahanan) ? dataTahanan : [];
  dataDarurat = Array.isArray(dataDarurat) ? dataDarurat : [];

  // Fungsi format vonis
  function formatVonis(vonis) {
    const tahun = Math.floor(vonis);
    const bulan = Math.round((vonis - tahun) * 12);
    return `${tahun} tahun ${bulan} bulan`;
  }

  // Fungsi hitung bebas murni
  function hitungBebasMurni(tanggalPenangkapan, vonis) {
    const tanggalPenangkapanObj = new Date(tanggalPenangkapan);
    const tahun = Math.floor(vonis);
    const bulan = Math.round((vonis - tahun) * 12);

    tanggalPenangkapanObj.setFullYear(tanggalPenangkapanObj.getFullYear() + tahun);
    tanggalPenangkapanObj.setMonth(tanggalPenangkapanObj.getMonth() + bulan);

    const tahunBebas = tanggalPenangkapanObj.getFullYear();
    const bulanBebas = String(tanggalPenangkapanObj.getMonth() + 1).padStart(2, '0');
    const hariBebas = String(tanggalPenangkapanObj.getDate()).padStart(2, '0');

    return `${tahunBebas}-${bulanBebas}-${hariBebas}`;
  }

  // Fungsi tampilkan data
  async function tampilkanData(data) {
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

  // Tampilkan data awal
  tampilkanData(dataTahanan);

  // Event listener untuk tombol tambah baris
  document.getElementById('tambah-baris').addEventListener('click', function() {
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

  // Event listener untuk hapus baris
  tabelTahanan.addEventListener('click', function(e) {
    if (e.target.classList.contains('hapus-baris')) {
      e.target.closest('tr').remove();
      nomorUrut--;
    }
  });

  // Event listener untuk form submit
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = [];
    const rows = tabelTahanan.rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nama = row.cells[1].querySelector('input').value;
      const vonis = parseFloat(row.cells[2].querySelector('input').value);
      const banding = row.cells[3].querySelector('select').value;
      const tanggalPenangkapan = row.cells[4].querySelector('input').value;

      data.push({ nama, vonis, banding, tanggalPenangkapan });

      if (vonis < 1.5) {
        dataDarurat.push({ nama, vonis, banding, tanggalPenangkapan });
      }
    }

    try {
      dataTahanan = dataTahanan.concat(data);
      await set(ref(database, 'tahanan'), dataTahanan);
      await set(ref(database, 'darurat'), dataDarurat);

      tampilkanData(dataTahanan);

      notifikasi.textContent = 'Data berhasil disimpan!';
      notifikasi.classList.remove('d-none');
      setTimeout(() => notifikasi.classList.add('d-none'), 3000);

      tabelTahanan.innerHTML = '';
      nomorUrut = 1;
    } catch (error) {
      notifikasi.textContent = 'Gagal menyimpan data: ' + error.message;
      notifikasi.classList.remove('d-none');
      notifikasi.classList.remove('alert-success');
      notifikasi.classList.add('alert-danger');
    }
  });

  // Event listener untuk hapus data
  tabelData.addEventListener('click', async function(e) {
    if (e.target.classList.contains('hapus-data')) {
      const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
      if (konfirmasi) {
        try {
          const index = e.target.getAttribute('data-index');
          dataTahanan.splice(index, 1);
          await set(ref(database, 'tahanan'), dataTahanan);
          tampilkanData(dataTahanan);
        } catch (error) {
          alert('Gagal menghapus data: ' + error.message);
        }
      }
    }
  });

  // Event listener untuk pencarian
  inputCari.addEventListener('input', function() {
    const keyword = inputCari.value.toLowerCase();
    const hasilPencarian = dataTahanan.filter(item => 
      item.nama.toLowerCase().includes(keyword)
    );
    tampilkanData(hasilPencarian);
  });
});