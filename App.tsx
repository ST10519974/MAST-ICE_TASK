import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Define the shape for single album objects
type Album = {
  id: string;
  title: string;
  artist: string;
  year: string;
  genre: string;
  rating: string;
};

// FIX 1: Explicit type definition for tracking validation error strings per field
type FormErrors = {
  title?: string;
  artist?: string;
  year?: string;
  genre?: string;
  rating?: string;
};

const genres: string[] = [
  'Alternative',
  'Blues',
  'Classical',
  'Country',
  'Electronic',
  'Hip Hop',
  'Jazz',
  'Metal',
  'Pop',
  'R&B',
  'Reggae',
  'Rock',
  'Soundtrack',
  'Soul',
  'Other',
];

const MIN_TEXT_LENGTH = 2;
const MAX_TITLE_LENGTH = 50;
const MAX_ARTIST_LENGTH = 50;
const MIN_YEAR = 1900;
const MAX_RATING = 5;

export default function App() {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [rating, setRating] = useState<string>('');

  const [albums, setAlbums] = useState<Album[]>([]);
  
  // FIX 2: State specifically dedicated to holding active form field errors
  const [errors, setErrors] = useState<FormErrors>({});

  // FIX 3: Centralized synchronous validation function returning a clean boolean
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Title Validation
    if (!title.trim()) {
      newErrors.title = 'Please enter an album title.';
    } else if (
      title.trim().length < MIN_TEXT_LENGTH ||
      title.trim().length > MAX_TITLE_LENGTH
    ) {
      newErrors.title = `Album title must be between ${MIN_TEXT_LENGTH} and ${MAX_TITLE_LENGTH} characters.`;
    }

    // 2. Artist Validation
    if (!artist.trim()) {
      newErrors.artist = 'Please enter an artist name.';
    } else if (
      artist.trim().length < MIN_TEXT_LENGTH ||
      artist.trim().length > MAX_ARTIST_LENGTH
    ) {
      newErrors.artist = `Artist name must be between ${MIN_TEXT_LENGTH} and ${MAX_ARTIST_LENGTH} characters.`;
    }

    // 3. Year Validation
    if (!year.trim()) {
      newErrors.year = 'Please enter an album release year.';
    } else {
      const numericYear = Number(year);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(numericYear)) {
        newErrors.year = 'Album year must be a whole number.';
      } else if (numericYear < MIN_YEAR || numericYear > currentYear) {
        newErrors.year = `Album year must be between ${MIN_YEAR} and ${currentYear}.`;
      }
    }

    // 4. Genre Validation
    if (!genre) {
      newErrors.genre = 'Please select a genre.';
    }

    // 5. Rating Validation
    if (!rating.trim()) {
      newErrors.rating = 'Please enter a rating.';
    } else {
      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating)) {
        newErrors.rating = 'Rating must be a whole number.';
      } else if (numericRating < 1 || numericRating > MAX_RATING) {
        newErrors.rating = `Rating must be between 1 and ${MAX_RATING}.`;
      }
    }

    // FIX 4: Immediately push all calculated errors to state so React re-renders field labels
    setErrors(newErrors);

    // Form is valid only if no key-value error pairs exist
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // FIX 5: Validate before saving; halts execution if validateForm() populated `errors`
    const isValid = validateForm();
    if (!isValid) return;

    const temporaryAlbum: Album = {
      id: Date.now().toString(),
      title: title.trim(),
      artist: artist.trim(),
      year: year.trim(),
      genre: genre,
      rating: rating.trim(),
    };

    setAlbums((prevAlbums) => [...prevAlbums, temporaryAlbum]);

    // Reset inputs & clear error indicators upon successful save
    setTitle('');
    setArtist('');
    setYear('');
    setGenre('');
    setRating('');
    setErrors({});
  };

  const handleDelete = (id: string) => {
    setAlbums((currentAlbums) =>
      currentAlbums.filter((album) => album.id !== id)
    );
  };

  const renderAlbum = ({ item }: { item: Album }) => (
    <View style={styles.albumCard}>
      <View style={styles.albumInformation}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.albumArtist}>{item.artist}</Text>
        <Text>Year: {item.year}</Text>
        <Text>Genre: {item.genre}</Text>
        <Text>Rating: {item.rating}/5</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbum}
        ListHeaderComponent={
          /* FIX 6: Container View ensuring proper inline padding inside FlatList header */
          <View style={styles.formContainer}>
            <Text style={styles.heading}>My Album Collection</Text>

            {/* --- Album Title Field --- */}
            <Text style={styles.label}>Album Title</Text>
            <TextInput
              /* FIX 7: Dynamic style array conditionally highlighting border in red on error */
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Enter album title"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                /* FIX 8: Clears individual field error when user starts typing */
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
            />
            {/* FIX 9: Conditional inline error text component directly beneath the input */}
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            {/* --- Artist Field --- */}
            <Text style={styles.label}>Artist</Text>
            <TextInput
              style={[styles.input, errors.artist ? styles.inputError : null]}
              placeholder="Enter artist name"
              value={artist}
              onChangeText={(text) => {
                setArtist(text);
                if (errors.artist) setErrors((prev) => ({ ...prev, artist: undefined }));
              }}
            />
            {errors.artist && <Text style={styles.errorText}>{errors.artist}</Text>}

            {/* --- Year Field --- */}
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={[styles.input, errors.year ? styles.inputError : null]}
              placeholder="Enter release year"
              value={year}
              onChangeText={(text) => {
                setYear(text);
                if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
              }}
              keyboardType="numeric"
            />
            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}

            {/* --- Genre Field (Picker) --- */}
            <Text style={styles.label}>Genre</Text>
            <View style={[styles.pickerContainer, errors.genre ? styles.inputError : null]}>
              <Picker
                selectedValue={genre}
                onValueChange={(value) => {
                  setGenre(value);
                  if (errors.genre) setErrors((prev) => ({ ...prev, genre: undefined }));
                }}
              >
                <Picker.Item label="Select a genre..." value="" />
                {genres.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>
            {errors.genre && <Text style={styles.errorText}>{errors.genre}</Text>}

            {/* --- Rating Field --- */}
            <Text style={styles.label}>Rating</Text>
            <TextInput
              style={[styles.input, errors.rating ? styles.inputError : null]}
              placeholder="Enter rating from 1 to 5"
              value={rating}
              onChangeText={(text) => {
                setRating(text);
                if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
              }}
              keyboardType="numeric"
            />
            {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}

            {/* Save Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleSave}>
              <Text style={styles.addButtonText}>Add to Favourites</Text>
            </TouchableOpacity>

            <Text style={styles.collectionHeading}>
              My Favourite Albums ({albums.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>
            No albums have been added yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#333333',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  // FIX 10: Style applied when a field fails validation (red highlight border)
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
  },
  // FIX 11: Style applied directly to the inline text rendered under the input
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 2,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  collectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  albumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  albumInformation: {
    marginBottom: 10,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  albumArtist: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 6,
  },
  deleteButton: {
    backgroundColor: '#c62828',
    borderRadius: 6,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 20,
    fontStyle: 'italic',
  },
});