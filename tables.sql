

-- Table: public.members

-- DROP TABLE public.members;

CREATE TABLE public.members
(
    username character varying COLLATE pg_catalog."default" NOT NULL,
    user_id integer NOT NULL DEFAULT nextval('members_user_id_seq'::regclass),
    password character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (user_id),
    CONSTRAINT uniqueusername UNIQUE (username)
        INCLUDE(username)
)

TABLESPACE pg_default;

ALTER TABLE public.members
    OWNER to postgres; 

    

-- Table: public.notes

-- DROP TABLE public.notes;

CREATE TABLE public.notes
(
    note_id integer NOT NULL DEFAULT nextval('notes_note_id_seq'::regclass),
    user_id integer NOT NULL,
    notes text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT notes_pkey PRIMARY KEY (note_id),
    CONSTRAINT "userId_FK" FOREIGN KEY (user_id)
        REFERENCES public.members (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE public.notes
    OWNER to postgres;