#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <sys/stat.h>

typedef uint16_t Elf64_Half;
typedef uint32_t Elf64_Word;
typedef int32_t  Elf64_Sword;
typedef uint64_t Elf64_Xword;
typedef int64_t  Elf64_Sxword;
typedef uint64_t Elf64_Addr;
typedef uint64_t Elf64_Off;

#define EI_MAG0 0
#define EI_MAG1 1
#define EI_MAG2 2
#define EI_MAG3 3
#define EI_CLASS 4
#define EI_DATA 5
#define EI_VERSION 6
#define EI_OSABI 7
#define ELFMAG0 0x7f
#define ELFMAG1 'E'
#define ELFMAG2 'L'
#define ELFMAG3 'F'
#define ELFCLASS64 2
#define ELFDATA2LSB 1
#define EV_CURRENT 1
#define ELFOSABI_NONE 0
#define ET_EXEC 2
#define EM_X86_64 62
#define PT_LOAD 1
#define PF_X 1
#define PF_W 2
#define PF_R 4
#define SHT_NULL 0
#define SHT_PROGBITS 1
#define SHT_SYMTAB 2
#define SHT_STRTAB 3
#define SHT_RELA 4
#define SHT_NOBITS 8
#define SHF_ALLOC 2
#define SHF_EXECINSTR 4
#define SHF_WRITE 1
#define SHT_REL 9
#define STB_GLOBAL 1
#define STB_WEAK 2
#define SHN_UNDEF 0
#define SHN_COMMON 0xfff2
#define ELF64_ST_BIND(i) ((i)>>4)
#define ELF64_ST_TYPE(i) ((i)&0xf)
#define ELF64_R_SYM(i) ((i)>>32)
#define ELF64_R_TYPE(i) ((i)&0xffffffffL)
#define R_X86_64_NONE 0
#define R_X86_64_64 1
#define R_X86_64_PC32 2
#define R_X86_64_32 10
#define R_X86_64_32S 11
#define R_X86_64_PLT32 4

typedef struct {
    unsigned char e_ident[16];
    Elf64_Half e_type;
    Elf64_Half e_machine;
    Elf64_Word e_version;
    Elf64_Addr e_entry;
    Elf64_Off e_phoff;
    Elf64_Off e_shoff;
    Elf64_Word e_flags;
    Elf64_Half e_ehsize;
    Elf64_Half e_phentsize;
    Elf64_Half e_phnum;
    Elf64_Half e_shentsize;
    Elf64_Half e_shnum;
    Elf64_Half e_shstrndx;
} Elf64_Ehdr;

typedef struct {
    Elf64_Word p_type;
    Elf64_Word p_flags;
    Elf64_Off p_offset;
    Elf64_Addr p_vaddr;
    Elf64_Addr p_paddr;
    Elf64_Xword p_filesz;
    Elf64_Xword p_memsz;
    Elf64_Xword p_align;
} Elf64_Phdr;

typedef struct {
    Elf64_Word sh_name;
    Elf64_Word sh_type;
    Elf64_Xword sh_flags;
    Elf64_Addr sh_addr;
    Elf64_Off sh_offset;
    Elf64_Xword sh_size;
    Elf64_Word sh_link;
    Elf64_Word sh_info;
    Elf64_Xword sh_addralign;
    Elf64_Xword sh_entsize;
} Elf64_Shdr;

typedef struct {
    Elf64_Word st_name;
    unsigned char st_info;
    unsigned char st_other;
    Elf64_Half st_shndx;
    Elf64_Addr st_value;
    Elf64_Xword st_size;
} Elf64_Sym;

typedef struct {
    Elf64_Addr r_offset;
    Elf64_Xword r_info;
    Elf64_Sxword r_addend;
} Elf64_Rela;

#define MAX_OBJECTS 4096
#define MAX_SYMBOLS 65536
#define MAX_SECTIONS 256
#define MAX_NAME 256
#define PAGE_SIZE 0x1000
#define BASE_ADDR 0x400000

typedef struct {
    char name[MAX_NAME];
    uint64_t size;
    uint64_t offset;
    int output_section;
    int is_common;
    int binding;
    int defined;
    int obj_index;
} Symbol;

typedef struct {
    char name[MAX_NAME];
    uint64_t offset;
    uint64_t size;
    uint32_t align;
    int output_index;
} InputSection;

typedef struct {
    uint8_t *data;
    uint64_t size;
    char name[MAX_NAME];
    int is_archive;
    int num_syms;
    Elf64_Sym *symtab;
    char *strtab;
    int symtab_size;
    int num_sections;
    Elf64_Shdr *sections;
    char *shstrtab;
    InputSection *input_sections;
} ObjectFile;

typedef struct {
    char name[MAX_NAME];
    uint64_t size;
    uint64_t offset;
    uint64_t addr;
    uint32_t align;
    uint32_t type;
    uint64_t flags;
} OutputSection;

static ObjectFile objects[MAX_OBJECTS];
static int num_objects = 0;
static Symbol symbols[MAX_SYMBOLS];
static int num_symbols = 0;
static OutputSection output_sections[MAX_SECTIONS];
static int num_output_sections = 0;

static uint8_t *output_buf = NULL;
static uint64_t output_size = 0;

static int find_symbol(const char *name) {
    for (int i = 0; i < num_symbols; i++) {
        if (strcmp(symbols[i].name, name) == 0)
            return i;
    }
    return -1;
}

static int add_symbol(const char *name, int binding, int defined,
                      uint64_t size, int is_common, int obj_idx) {
    int idx = find_symbol(name);
    if (idx >= 0) {
        if (defined && !symbols[idx].defined) {
            symbols[idx].defined = 1;
            symbols[idx].size = size;
            symbols[idx].is_common = 0;
            symbols[idx].obj_index = obj_idx;
        } else if (is_common && symbols[idx].is_common) {
            if (size > symbols[idx].size)
                symbols[idx].size = size;
        }
        return idx;
    }
    if (num_symbols >= MAX_SYMBOLS) return -1;
    idx = num_symbols++;
    strncpy(symbols[idx].name, name, MAX_NAME - 1);
    symbols[idx].name[MAX_NAME - 1] = 0;
    symbols[idx].binding = binding;
    symbols[idx].defined = defined;
    symbols[idx].size = size;
    symbols[idx].is_common = is_common;
    symbols[idx].obj_index = obj_idx;
    symbols[idx].output_section = -1;
    symbols[idx].offset = 0;
    return idx;
}

static uint8_t *read_file(const char *path, uint64_t *size) {
    FILE *f = fopen(path, "rb");
    if (!f) return NULL;
    fseek(f, 0, SEEK_END);
    long sz = ftell(f);
    fseek(f, 0, SEEK_SET);
    uint8_t *buf = malloc(sz);
    if (!buf) { fclose(f); return NULL; }
    if (fread(buf, 1, sz, f) != (size_t)sz) {
        free(buf);
        fclose(f);
        return NULL;
    }
    fclose(f);
    *size = sz;
    return buf;
}

static int is_archive(const uint8_t *data, uint64_t size) {
    return size >= 8 && memcmp(data, "!<arch>\n", 8) == 0;
}

static int is_elf(const uint8_t *data, uint64_t size) {
    return size >= 4 && data[0] == 0x7f && data[1] == 'E' &&
           data[2] == 'L' && data[3] == 'F';
}

static int parse_elf_object(uint8_t *data, uint64_t size) {
    if (num_objects >= MAX_OBJECTS) return -1;
    int idx = num_objects++;
    ObjectFile *obj = &objects[idx];
    memset(obj, 0, sizeof(*obj));
    obj->data = data;
    obj->size = size;
    obj->is_archive = 0;

    Elf64_Ehdr *ehdr = (Elf64_Ehdr *)data;
    obj->num_sections = ehdr->e_shnum;
    obj->sections = (Elf64_Shdr *)(data + ehdr->e_shoff);

    if (ehdr->e_shstrndx < obj->num_sections) {
        Elf64_Shdr *shstrtab_shdr = &obj->sections[ehdr->e_shstrndx];
        obj->shstrtab = (char *)(data + shstrtab_shdr->sh_offset);
    }

    for (int i = 0; i < obj->num_sections; i++) {
        Elf64_Shdr *shdr = &obj->sections[i];
        if (shdr->sh_type == SHT_SYMTAB) {
            obj->symtab = (Elf64_Sym *)(data + shdr->sh_offset);
            obj->symtab_size = shdr->sh_size / sizeof(Elf64_Sym);
            if (shdr->sh_link < (Elf64_Word)obj->num_sections) {
                Elf64_Shdr *strtab_shdr = &obj->sections[shdr->sh_link];
                obj->strtab = (char *)(data + strtab_shdr->sh_offset);
            }
        }
    }

    obj->input_sections = calloc(obj->num_sections, sizeof(InputSection));
    for (int i = 0; i < obj->num_sections; i++) {
        obj->input_sections[i].output_index = -1;
    }

    return idx;
}

static int parse_archive(uint8_t *data, uint64_t size) {
    uint64_t pos = 8;
    int first = -1;
    while (pos + 60 <= size) {
        if (data[pos] == '\n') { pos++; continue; }
        char size_str[11] = {0};
        memcpy(size_str, data + pos + 48, 10);
        uint64_t member_size = strtoull(size_str, NULL, 10);
        uint64_t data_offset = pos + 60;
        if (data_offset + member_size > size) break;

        char name[17] = {0};
        memcpy(name, data + pos, 16);

        if (member_size >= 4 &&
            data[data_offset] == 0x7f && data[data_offset+1] == 'E' &&
            data[data_offset+2] == 'L' && data[data_offset+3] == 'F') {
            uint8_t *elf_data = malloc(member_size);
            memcpy(elf_data, data + data_offset, member_size);
            int idx = parse_elf_object(elf_data, member_size);
            objects[idx].is_archive = 1;
            if (first < 0) first = idx;
        }

        pos = data_offset + member_size;
        if (pos % 2) pos++;
    }
    return first;
}

static void collect_symbols(void) {
    for (int i = 0; i < num_objects; i++) {
        ObjectFile *obj = &objects[i];
        if (!obj->symtab) continue;
        for (int j = 0; j < obj->symtab_size; j++) {
            Elf64_Sym *sym = &obj->symtab[j];
            const char *name = &obj->strtab[sym->st_name];
            if (!name[0]) continue;
            int bind = ELF64_ST_BIND(sym->st_info);
            if (bind != STB_GLOBAL && bind != STB_WEAK) continue;

            if (sym->st_shndx == SHN_UNDEF) {
                add_symbol(name, bind, 0, 0, 0, i);
            } else if (sym->st_shndx == SHN_COMMON) {
                add_symbol(name, bind, 0, sym->st_size, 1, i);
            } else {
                add_symbol(name, bind, 1, sym->st_size, 0, i);
            }
        }
    }
}

static void assign_sections(void) {
    for (int i = 0; i < num_objects; i++) {
        ObjectFile *obj = &objects[i];
        if (!obj->symtab) continue;
        for (int j = 0; j < obj->symtab_size; j++) {
            Elf64_Sym *sym = &obj->symtab[j];
            const char *name = &obj->strtab[sym->st_name];
            if (!name[0]) continue;
            int bind = ELF64_ST_BIND(sym->st_info);
            if (bind != STB_GLOBAL && bind != STB_WEAK) continue;

            int sym_idx = find_symbol(name);
            if (sym_idx < 0) continue;
            if (symbols[sym_idx].defined) continue;

            if (sym->st_shndx == SHN_COMMON || symbols[sym_idx].is_common) {
                symbols[sym_idx].is_common = 1;
                symbols[sym_idx].defined = 1;
            }
        }
    }
}

static int get_or_create_output_section(const char *name, uint32_t type, uint64_t flags) {
    for (int i = 0; i < num_output_sections; i++) {
        if (strcmp(output_sections[i].name, name) == 0)
            return i;
    }
    if (num_output_sections >= MAX_SECTIONS) return -1;
    int idx = num_output_sections++;
    strncpy(output_sections[idx].name, name, MAX_NAME - 1);
    output_sections[idx].name[MAX_NAME - 1] = 0;
    output_sections[idx].size = 0;
    output_sections[idx].offset = 0;
    output_sections[idx].addr = 0;
    output_sections[idx].align = 1;
    output_sections[idx].type = type;
    output_sections[idx].flags = flags;
    return idx;
}

static int section_contributes(const char *name) {
    if (strncmp(name, ".text", 5) == 0) return 1;
    if (strncmp(name, ".rodata", 7) == 0) return 1;
    if (strncmp(name, ".data", 5) == 0) return 1;
    if (strcmp(name, ".bss") == 0) return 1;
    return 0;
}

static void layout_sections(void) {
    int text_idx = get_or_create_output_section(".text", SHT_PROGBITS,
                                                 SHF_ALLOC | SHF_EXECINSTR);
    int rodata_idx = get_or_create_output_section(".rodata", SHT_PROGBITS, SHF_ALLOC);
    int data_idx = get_or_create_output_section(".data", SHT_PROGBITS,
                                                 SHF_ALLOC | SHF_WRITE);
    int bss_idx = get_or_create_output_section(".bss", SHT_NOBITS,
                                                SHF_ALLOC | SHF_WRITE);

    for (int i = 0; i < num_objects; i++) {
        ObjectFile *obj = &objects[i];
        for (int j = 0; j < obj->num_sections; j++) {
            Elf64_Shdr *shdr = &obj->sections[j];
            const char *sname = &obj->shstrtab[shdr->sh_name];
            if (!section_contributes(sname)) continue;
            if (shdr->sh_type == SHT_NULL || shdr->sh_type == SHT_REL ||
                shdr->sh_type == SHT_RELA || shdr->sh_type == SHT_SYMTAB ||
                shdr->sh_type == SHT_STRTAB)
                continue;

            int out_idx;
            if (strncmp(sname, ".text", 5) == 0) out_idx = text_idx;
            else if (strncmp(sname, ".rodata", 7) == 0) out_idx = rodata_idx;
            else if (strncmp(sname, ".data", 5) == 0) out_idx = data_idx;
            else out_idx = bss_idx;

            OutputSection *out = &output_sections[out_idx];
            uint64_t align = shdr->sh_addralign;
            if (align > 1) {
                out->size = (out->size + align - 1) & ~(align - 1);
                if (align > out->align) out->align = align;
            }
            obj->input_sections[j].offset = out->size;
            obj->input_sections[j].size = shdr->sh_size;
            obj->input_sections[j].output_index = out_idx;
            strncpy(obj->input_sections[j].name, sname, MAX_NAME - 1);
            obj->input_sections[j].name[MAX_NAME - 1] = 0;
            out->size += shdr->sh_size;
        }
    }
}

static void compute_addresses(void) {
    uint64_t addr = BASE_ADDR + 0x1000;
    for (int i = 0; i < num_output_sections; i++) {
        OutputSection *sec = &output_sections[i];
        if (sec->align > 1)
            addr = (addr + sec->align - 1) & ~((uint64_t)sec->align - 1);
        sec->addr = addr;
        addr += sec->size;
    }

    for (int i = 0; i < num_symbols; i++) {
        if (!symbols[i].defined) continue;
        if (symbols[i].is_common) {
            int bss_idx = -1;
            for (int j = 0; j < num_output_sections; j++) {
                if (strcmp(output_sections[j].name, ".bss") == 0) {
                    bss_idx = j;
                    break;
                }
            }
            if (bss_idx >= 0) {
                symbols[i].output_section = bss_idx;
                symbols[i].offset = output_sections[bss_idx].size;
                uint64_t align = 8;
                symbols[i].offset = (symbols[i].offset + align - 1) & ~(align - 1);
                output_sections[bss_idx].size = symbols[i].offset + symbols[i].size;
            }
            continue;
        }

        for (int j = 0; j < num_objects; j++) {
            ObjectFile *obj = &objects[j];
            if (!obj->symtab) continue;
            for (int k = 0; k < obj->symtab_size; k++) {
                Elf64_Sym *sym = &obj->symtab[k];
                const char *sname = &obj->strtab[sym->st_name];
                if (strcmp(sname, symbols[i].name) != 0) continue;
                if (sym->st_shndx == SHN_UNDEF || sym->st_shndx == SHN_COMMON) continue;
                int bind = ELF64_ST_BIND(sym->st_info);
                if (bind != STB_GLOBAL && bind != STB_WEAK) continue;

                if (sym->st_shndx < obj->num_sections) {
                    int out_idx = obj->input_sections[sym->st_shndx].output_index;
                    if (out_idx >= 0) {
                        symbols[i].output_section = out_idx;
                        symbols[i].offset = obj->input_sections[sym->st_shndx].offset +
                                            sym->st_value;
                    }
                }
                goto found_sym;
            }
        }
        found_sym:;
    }
}

static void write_elf(const char *output_path) {
    uint64_t ehdr_size = sizeof(Elf64_Ehdr);
    uint64_t phdr_size = sizeof(Elf64_Phdr);
    int num_phdrs = 3;

    uint64_t phdr_offset = ehdr_size;
    uint64_t headers_size = ehdr_size + phdr_size * num_phdrs;
    uint64_t text_file_start = (headers_size + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1);

    int text_out = -1, rodata_out = -1, data_out = -1, bss_out = -1;
    for (int i = 0; i < num_output_sections; i++) {
        if (strcmp(output_sections[i].name, ".text") == 0) text_out = i;
        else if (strcmp(output_sections[i].name, ".rodata") == 0) rodata_out = i;
        else if (strcmp(output_sections[i].name, ".data") == 0) data_out = i;
        else if (strcmp(output_sections[i].name, ".bss") == 0) bss_out = i;
    }

    uint64_t text_seg_filesz = 0;
    uint64_t text_seg_memsz = 0;
    if (text_out >= 0) {
        text_seg_filesz = output_sections[text_out].addr + output_sections[text_out].size - BASE_ADDR;
        text_seg_memsz = text_seg_filesz;
    }
    if (rodata_out >= 0) {
        uint64_t end = output_sections[rodata_out].addr + output_sections[rodata_out].size - BASE_ADDR;
        if (end > text_seg_filesz) text_seg_filesz = end;
        if (end > text_seg_memsz) text_seg_memsz = end;
    }

    uint64_t data_file_start = (text_file_start + text_seg_filesz + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1);
    uint64_t data_seg_filesz = 0;
    uint64_t data_seg_memsz = 0;
    if (data_out >= 0) {
        data_seg_filesz = output_sections[data_out].size;
        data_seg_memsz = data_seg_filesz;
    }
    if (bss_out >= 0) {
        data_seg_memsz += output_sections[bss_out].size;
    }

    uint64_t total_size = data_file_start + data_seg_filesz;
    output_buf = calloc(1, total_size);
    output_size = total_size;

    Elf64_Ehdr *ehdr = (Elf64_Ehdr *)output_buf;
    ehdr->e_ident[EI_MAG0] = ELFMAG0;
    ehdr->e_ident[EI_MAG1] = ELFMAG1;
    ehdr->e_ident[EI_MAG2] = ELFMAG2;
    ehdr->e_ident[EI_MAG3] = ELFMAG3;
    ehdr->e_ident[EI_CLASS] = ELFCLASS64;
    ehdr->e_ident[EI_DATA] = ELFDATA2LSB;
    ehdr->e_ident[EI_VERSION] = EV_CURRENT;
    ehdr->e_ident[EI_OSABI] = ELFOSABI_NONE;
    ehdr->e_type = ET_EXEC;
    ehdr->e_machine = EM_X86_64;
    ehdr->e_version = EV_CURRENT;

    uint64_t entry = 0;
    for (int i = 0; i < num_symbols; i++) {
        if (strcmp(symbols[i].name, "_start") == 0 && symbols[i].defined) {
            entry = output_sections[symbols[i].output_section].addr + symbols[i].offset;
            break;
        }
    }
    ehdr->e_entry = entry;
    ehdr->e_phoff = phdr_offset;
    ehdr->e_ehsize = ehdr_size;
    ehdr->e_phentsize = phdr_size;
    ehdr->e_phnum = num_phdrs;

    Elf64_Phdr *phdrs = (Elf64_Phdr *)(output_buf + phdr_offset);
    memset(phdrs, 0, phdr_size * num_phdrs);

    phdrs[0].p_type = PT_LOAD;
    phdrs[0].p_flags = PF_R | PF_X;
    phdrs[0].p_offset = 0;
    phdrs[0].p_vaddr = BASE_ADDR;
    phdrs[0].p_paddr = BASE_ADDR;
    phdrs[0].p_filesz = text_file_start + text_seg_filesz;
    phdrs[0].p_memsz = text_file_start + text_seg_memsz;
    phdrs[0].p_align = PAGE_SIZE;

    phdrs[1].p_type = PT_LOAD;
    phdrs[1].p_flags = PF_R | PF_W;
    phdrs[1].p_offset = data_file_start;
    phdrs[1].p_vaddr = BASE_ADDR + data_file_start;
    phdrs[1].p_paddr = BASE_ADDR + data_file_start;
    phdrs[1].p_filesz = data_seg_filesz;
    phdrs[1].p_memsz = data_seg_memsz;
    phdrs[1].p_align = PAGE_SIZE;

    for (int i = 0; i < num_output_sections; i++) {
        OutputSection *sec = &output_sections[i];
        if (sec->type == SHT_NOBITS) continue;
        uint64_t off;
        if (i == text_out || i == rodata_out) {
            off = text_file_start + (sec->addr - BASE_ADDR);
        } else if (i == data_out) {
            off = data_file_start;
        } else {
            continue;
        }
        sec->offset = off;
    }

    for (int i = 0; i < num_objects; i++) {
        ObjectFile *obj = &objects[i];
        for (int j = 0; j < obj->num_sections; j++) {
            int out_idx = obj->input_sections[j].output_index;
            if (out_idx < 0) continue;
            OutputSection *out = &output_sections[out_idx];
            if (out->type == SHT_NOBITS) continue;
            Elf64_Shdr *shdr = &obj->sections[j];
            if (shdr->sh_type == SHT_NOBITS) continue;
            uint64_t dst = out->offset + obj->input_sections[j].offset;
            if (dst + shdr->sh_size <= output_size) {
                memcpy(output_buf + dst, obj->data + shdr->sh_offset, shdr->sh_size);
            }
        }
    }

    for (int i = 0; i < num_objects; i++) {
        ObjectFile *obj = &objects[i];
        for (int j = 0; j < obj->num_sections; j++) {
            Elf64_Shdr *shdr = &obj->sections[j];
            if (shdr->sh_type != SHT_RELA) continue;

            int target_out = obj->input_sections[shdr->sh_info].output_index;
            if (target_out < 0) continue;

            Elf64_Rela *relas = (Elf64_Rela *)(obj->data + shdr->sh_offset);
            int num_relas = shdr->sh_size / sizeof(Elf64_Rela);
            Elf64_Sym *local_symtab = obj->symtab;

            for (int k = 0; k < num_relas; k++) {
                Elf64_Rela *rela = &relas[k];
                int sym_idx = ELF64_R_SYM(rela->r_info);
                int rel_type = ELF64_R_TYPE(rela->r_info);

                uint64_t target_base = output_sections[target_out].offset +
                                       obj->input_sections[shdr->sh_info].offset;
                uint64_t patch_offset = target_base + rela->r_offset;

                Elf64_Sym *esym = &local_symtab[sym_idx];
                const char *symname = &obj->strtab[esym->st_name];

                uint64_t sym_val = 0;
                if (esym->st_shndx != SHN_UNDEF && esym->st_shndx != SHN_COMMON) {
                    int sym_out = obj->input_sections[esym->st_shndx].output_index;
                    if (sym_out >= 0) {
                        sym_val = output_sections[sym_out].addr +
                                  obj->input_sections[esym->st_shndx].offset +
                                  esym->st_value;
                    }
                } else if (esym->st_shndx == SHN_COMMON) {
                    int gidx = find_symbol(symname);
                    if (gidx >= 0 && symbols[gidx].output_section >= 0) {
                        sym_val = output_sections[symbols[gidx].output_section].addr +
                                  symbols[gidx].offset;
                    }
                } else {
                    int gidx = find_symbol(symname);
                    if (gidx >= 0 && symbols[gidx].defined && symbols[gidx].output_section >= 0) {
                        sym_val = output_sections[symbols[gidx].output_section].addr +
                                  symbols[gidx].offset;
                    }
                }

                uint64_t S = sym_val;
                uint64_t A = rela->r_addend;
                uint64_t P = patch_offset;

                switch (rel_type) {
                case R_X86_64_64: {
                    uint64_t val = S + A;
                    if (patch_offset + 8 <= output_size)
                        memcpy(output_buf + patch_offset, &val, 8);
                    break;
                }
                case R_X86_64_PC32:
                case R_X86_64_PLT32: {
                    int64_t val = (int64_t)(S + A - P);
                    int32_t val32 = (int32_t)val;
                    if (patch_offset + 4 <= output_size)
                        memcpy(output_buf + patch_offset, &val32, 4);
                    break;
                }
                case R_X86_64_32S: {
                    int64_t val = (int64_t)(S + A);
                    int32_t val32 = (int32_t)val;
                    if (patch_offset + 4 <= output_size)
                        memcpy(output_buf + patch_offset, &val32, 4);
                    break;
                }
                case R_X86_64_32: {
                    uint64_t val = S + A;
                    uint32_t val32 = (uint32_t)val;
                    if (patch_offset + 4 <= output_size)
                        memcpy(output_buf + patch_offset, &val32, 4);
                    break;
                }
                case R_X86_64_NONE:
                    break;
                default:
                    break;
                }
            }
        }
    }

    FILE *f = fopen(output_path, "wb");
    if (f) {
        fwrite(output_buf, 1, output_size, f);
        fclose(f);
    }
    chmod(output_path, 0755);
}

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "usage: myld -o output file...\n");
        return 1;
    }

    char *output = NULL;
    for (int i = 1; i < argc - 1; i++) {
        if (strcmp(argv[i], "-o") == 0) {
            output = argv[i + 1];
            break;
        }
    }
    if (!output) {
        fprintf(stderr, "myld: missing -o\n");
        return 1;
    }

    char *files[MAX_OBJECTS];
    int nfiles = 0;
    int skip_next = 0;
    for (int i = 1; i < argc; i++) {
        if (skip_next) { skip_next = 0; continue; }
        if (strcmp(argv[i], "-o") == 0) { skip_next = 1; continue; }
        if (nfiles < MAX_OBJECTS) files[nfiles++] = argv[i];
    }

    for (int i = 0; i < nfiles; i++) {
        uint64_t size;
        uint8_t *data = read_file(files[i], &size);
        if (!data) {
            fprintf(stderr, "myld: cannot read %s\n", files[i]);
            continue;
        }
        if (is_elf(data, size)) {
            parse_elf_object(data, size);
        } else if (is_archive(data, size)) {
            parse_archive(data, size);
        } else {
            free(data);
        }
    }

    collect_symbols();
    assign_sections();
    layout_sections();
    compute_addresses();
    write_elf(output);

    for (int i = 0; i < num_objects; i++) {
        free(objects[i].data);
        free(objects[i].input_sections);
    }
    free(output_buf);

    return 0;
}
