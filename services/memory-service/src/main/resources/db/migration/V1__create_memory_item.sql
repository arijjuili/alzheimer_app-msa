CREATE TYPE memory_category AS ENUM (
    'FAMILY',
    'FRIENDS',
    'PLACES',
    'EVENTS',
    'HOBBIES',
    'WORK'
);

CREATE TABLE memory_item (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    memory_category memory_category NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    image_url TEXT,
    location VARCHAR,
    year_taken INT,
    persons TEXT[],
    questions TEXT[],
    correct_answers TEXT[],
    storybook_selected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_memory_item_patient ON memory_item (patient_id);
CREATE INDEX idx_memory_item_patient_created ON memory_item (patient_id, created_at DESC);
