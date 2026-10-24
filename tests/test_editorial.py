"""Editorial integrity: verify new draft chapters and prohibit fabricated certification."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOLUME = ROOT / "manuscript" / "volume-02"
CLAIMS = ROOT / "research" / "volume-02"
CHAPTERS = {
    "chapter-04-torna.md": ("torna-claims.json", 3),
    "chapter-05-purandar.md": ("purandar-claims.json", 3),
    "chapter-06-javali.md": ("javali-claims.json", 4),
}

class EditorialDraftTests(unittest.TestCase):
    def test_substantive_narrative_and_caution(self):
        for name in CHAPTERS:
            with self.subTest(name=name):
                text = (VOLUME / name).read_text(encoding="utf-8")
                self.assertGreaterEqual(len(text.split()), 300)
                self.assertGreaterEqual(len(re.findall(r"^### ", text, re.M)), 3)
                self.assertTrue(any(s in text for s in ("पडताळणी", "परीक्षण", "प्रलंबित")))

    def test_claims_are_linked_and_uncertified(self):
        all_ids = set()
        for chapter, (register, expected) in CHAPTERS.items():
            with self.subTest(chapter=chapter):
                text = (VOLUME / chapter).read_text(encoding="utf-8")
                data = json.loads((CLAIMS / register).read_text(encoding="utf-8"))
                self.assertEqual(Path(data["chapter"]).name, chapter)
                self.assertEqual(len(data["claims"]), expected)
                self.assertTrue(data["sourceLeads"])
                self.assertIn("not", data["note"].lower())
                for claim in data["claims"]:
                    ident = claim["id"]
                    self.assertRegex(ident, r"^SV-E-2[0-9]{2}$")
                    self.assertNotIn(ident, all_ids)
                    all_ids.add(ident)
                    self.assertIn(ident, text)
                    self.assertIn(claim["status"], ("lead", "unverified", "disputed-unresolved"))
                    self.assertGreater(len(claim["next"]), 12)

    def test_volume_one_remains_present(self):
        for name in ("chapter-01-deccan.md", "chapter-02-shivneri.md",
                     "chapter-03-pune-maval.md"):
            self.assertTrue((ROOT / "manuscript" / "volume-01" / name).is_file())

if __name__ == "__main__":
    unittest.main()
