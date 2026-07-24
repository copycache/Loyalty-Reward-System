<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblSlotCodeChangesLogsSlotIdNewColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_slot_code_change_logs', function (Blueprint $table) 
        {   
            $table->integer('slot_id')->unsigned()->after('user_id');
            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
