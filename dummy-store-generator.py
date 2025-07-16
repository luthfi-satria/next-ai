import json
import os
import random
import uuid
from datetime import datetime

from faker import Faker

# Inisialisasi Faker dengan lokal Indonesia
fake = Faker('id_ID')

def generate_store_data_for_files():
    """
    Menghasilkan satu dokumen dummy toko dengan format yang sesuai untuk file.
    """
    latitude = float(fake.latitude())
    longitude = float(fake.longitude())
    publish_statuses = ['PUBLISHED', 'UNPUBLISHED']
    provinces = [
        "Aceh", "Bali", "Banten", "Bengkulu", "Daerah Istimewa Yogyakarta",
        "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah",
        "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
        "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
        "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
        "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat",
        "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara",
        "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"
    ]

    # Ini adalah UUID yang akan menjadi pengenal umum di kedua database
    common_uuid = str(uuid.uuid4())

    base_data = {
        "name": fake.company(),
        "city": fake.city(),
        "province": random.choice(provinces),
        "postalCode": fake.postcode(),
        "publish": random.choice(publish_statuses),
    }

    # Format lokasi untuk Elasticsearch (geo_point): [longitude, latitude]
    es_location = [longitude, latitude]

    # Format lokasi untuk MongoDB (GeoJSON Point): { type: "Point", coordinates: [longitude, latitude] }
    mongo_location = {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }

    # Dokumen siap untuk Elasticsearch bulk API (action + document)
    # Elasticsearch akan menggunakan common_uuid sebagai _id-nya
    es_bulk_action = {"index": {"_id": common_uuid}}
    es_bulk_doc = {
        **base_data,
        "location": es_location,
        "uuid_id": common_uuid # Tambahkan common_uuid sebagai field terpisah untuk linking eksplisit
    }

    # Dokumen siap untuk MongoDB bulk import (plain JSON object)
    # MongoDB akan menghasilkan _id-nya sendiri (ObjectId),
    # tetapi kita akan menyimpan common_uuid sebagai field terpisah
    mongo_doc = {
        **base_data,
        "location": mongo_location,
        "uuid_id": common_uuid # Tambahkan common_uuid sebagai field terpisah untuk linking eksplisit
    }

    return es_bulk_action, es_bulk_doc, mongo_doc

def generate_and_save_data_to_files(num_stores=10):
    """
    Menghasilkan dummy data dan menyimpannya ke file terpisah.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    es_filename = f"stores_data_elasticsearch_{timestamp}.json"
    mongo_filename = f"stores_data_mongo_{timestamp}.json"

    print(f"Menghasilkan {num_stores} toko dummy dan menyimpannya ke file...")

    with open(es_filename, 'w') as es_file, \
         open(mongo_filename, 'w') as mongo_file:

        for i in range(num_stores):
            es_bulk_action, es_bulk_doc, mongo_doc = generate_store_data_for_files()

            # Tulis ke file Elasticsearch (format NDJSON untuk _bulk API)
            es_file.write(json.dumps(es_bulk_action) + '\n')
            es_file.write(json.dumps(es_bulk_doc) + '\n')

            # Tulis ke file MongoDB (format NDJSON)
            mongo_file.write(json.dumps(mongo_doc) + '\n')

            if (i + 1) % 100 == 0:
                print(f"  Progress: {i + 1}/{num_stores} stores generated and written to files.")

    print(f"Selesai! Data disimpan di:")
    print(f"  Elasticsearch: {es_filename}")
    print(f"  MongoDB: {mongo_filename}")

# Contoh penggunaan
if __name__ == "__main__":
    num_stores_to_generate = 1000 # Anda bisa mengubah jumlah ini
    generate_and_save_data_to_files(num_stores_to_generate)