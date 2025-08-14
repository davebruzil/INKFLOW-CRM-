#!/usr/bin/env python3
"""
STT Bridge for Claude Code CLI
Captures STT output and sends it directly to Claude Code
"""

import subprocess
import sys
import re
import threading
import queue
import time

class STTBridge:
    def __init__(self):
        self.stt_process = None
        self.message_queue = queue.Queue()
        self.running = False
        
    def start_stt(self):
        """Start the STT process with optimal settings"""
        cmd = ['stt', '-c', '--post-silence', '2.0', '--end-pause', '1.5']
        self.stt_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=0
        )
        self.running = True
        
        # Start monitoring thread
        monitor_thread = threading.Thread(target=self._monitor_stt_output)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        print("[MIC] STT Bridge started - speak now!")
        print("Say 'stop listening' to exit")
        
    def _monitor_stt_output(self):
        """Monitor STT output and extract sentences"""
        while self.running and self.stt_process:
            try:
                line = self.stt_process.stdout.readline()
                if not line:
                    break
                    
                # Extract sentence from STT output
                if 'Sentence:' in line:
                    sentence = line.split('Sentence:', 1)[1].strip()
                    if sentence:
                        self._process_voice_command(sentence)
                        
            except Exception as e:
                print(f"Error monitoring STT: {e}")
                break
                
    def _process_voice_command(self, sentence):
        """Process voice command and send to Claude Code"""
        sentence = sentence.strip()
        
        # Exit commands
        if any(phrase in sentence.lower() for phrase in ['stop listening', 'exit bridge', 'quit stt']):
            print("[STOP] Stopping STT bridge...")
            self.stop()
            return
            
        # Send to Claude Code
        print(f"[VOICE] {sentence}")
        print("[SEND] Sending to Claude Code...")
        
        # Output the sentence so it can be processed by Claude Code
        sys.stdout.write(f"\n{sentence}\n")
        sys.stdout.flush()
        
        # Also write to a file for easy copy/paste
        with open("voice_commands.txt", "a", encoding="utf-8") as f:
            f.write(f"{sentence}\n")
            f.flush()
        
    def stop(self):
        """Stop the STT bridge"""
        self.running = False
        if self.stt_process:
            self.stt_process.terminate()
            self.stt_process = None
        print("[STOP] STT Bridge stopped")

def main():
    bridge = STTBridge()
    
    try:
        bridge.start_stt()
        
        # Keep alive
        while bridge.running:
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n[WARN] Interrupted by user")
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        bridge.stop()

if __name__ == "__main__":
    main()